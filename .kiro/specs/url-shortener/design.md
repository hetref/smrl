# Design Document: URL Shortener

## Overview

This document describes the design for a self-hosted, single-user URL shortener built with Next.js 16 (App Router), JavaScript, Prisma 7, NeonDB (Postgres), and Clerk authentication. The system prioritizes redirect performance by using Next.js Proxy architecture instead of middleware, ensuring edge-optimized redirects with fire-and-forget analytics logging.

The architecture follows a clear separation of concerns:
- **Proxy layer**: Handles fast redirects at the edge
- **API layer**: Manages URL creation and analytics logging
- **UI layer**: Provides authenticated dashboard and public landing page
- **Data layer**: Persists URLs and analytics via Prisma

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└───────────────┬─────────────────────────────────┬───────────┘
                │                                 │
                │ Short URL Access                │ Dashboard Access
                │ /r/[slug]                       │ /dashboard/**
                │                                 │
                ▼                                 ▼
┌───────────────────────────┐     ┌──────────────────────────┐
│   Next.js Proxy (Edge)    │     │   Clerk Auth Middleware  │
│   app/r/[...slug]/proxy.js│     │   (via proxy.js)         │
└───────────┬───────────────┘     └──────────┬───────────────┘
            │                                 │
            │ 302 Redirect                    │ Authenticated
            │                                 │
            ▼                                 ▼
┌───────────────────────────┐     ┌──────────────────────────┐
│   Fire-and-Forget         │     │   Dashboard Pages        │
│   Analytics API           │     │   - Overview             │
│   POST /api/urls/stats    │     │   - Create URL           │
└───────────┬───────────────┘     │   - List URLs            │
            │                     └──────────┬───────────────┘
            │                                 │
            │                                 │ Create URL
            │                                 ▼
            │                     ┌──────────────────────────┐
            │                     │   URL Creation API       │
            │                     │   POST /api/urls/create  │
            │                     └──────────┬───────────────┘
            │                                 │
            └─────────────┬───────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   Prisma Client     │
                │   (lib/prisma.js)   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   NeonDB (Postgres) │
                │   - ShortUrl        │
                │   - ClickLog        │
                └─────────────────────┘
```

### Key Architectural Decisions

1. **Next.js Proxy over Middleware**: The redirect path uses Next.js proxy files (`proxy.js`) instead of middleware to avoid auth/runtime conflicts and ensure edge compatibility with the latest Next.js version.

2. **Fire-and-Forget Analytics**: The proxy immediately redirects users without waiting for analytics logging. Analytics are logged asynchronously via a separate API call that doesn't block the redirect.

3. **Edge-First Design**: The redirect proxy runs at the edge for minimal latency, with only a database read required before redirecting.

4. **Single-User Model**: No user table exists in the database. Clerk handles authentication, and all URLs belong to the single authenticated user.

## Components and Interfaces

### 1. Slug Generator (`lib/slug.js`)

**Purpose**: Generate cryptographically random, URL-safe slugs.

**Interface**:
```javascript
/**
 * Generate a random URL-safe slug
 * @param {number} length - Length of slug (default: 6, range: 4-10)
 * @returns {string} Base64url-encoded slug
 */
export function generateSlug(length = 6)
```

**Implementation Details**:
- Uses Node.js `crypto.randomBytes()` for cryptographic randomness
- Encodes bytes using base64url (URL-safe variant without padding)
- Slices to exact requested length
- Output matches pattern: `[a-zA-Z0-9_-]+`

### 2. Redirect Proxy (`app/r/[...slug]/proxy.js`)

**Purpose**: Handle short URL redirects at the edge with maximum performance.

**Request Flow**:
1. Extract slug from URL path
2. Query database for matching ShortUrl record
3. If found: Return 302 redirect to targetUrl
4. If not found: Return 404 response
5. Trigger fire-and-forget analytics logging (non-blocking)

**Edge Compatibility Requirements**:
- Must use Edge Runtime
- Database queries must be edge-compatible
- No blocking operations
- Minimal dependencies

**Interface**:
```javascript
// Next.js proxy file convention
export const runtime = 'edge'

export async function GET(request, { params })
```

### 3. URL Creation API (`app/api/urls/create/route.js`)

**Purpose**: Create new short URLs with validation.

**Endpoint**: `POST /api/urls/create`

**Request Body**:
```javascript
{
  targetUrl: string,      // Required, must start with https://
  customSlug?: string     // Optional, 4-10 chars, [a-zA-Z0-9_-]+
}
```

**Response** (Success - 201):
```javascript
{
  slug: string,
  shortUrl: string,       // Full URL: https://domain.com/r/[slug]
  targetUrl: string,
  createdAt: string       // ISO 8601 timestamp
}
```

**Response** (Error - 400/409):
```javascript
{
  error: string           // Descriptive error message
}
```

**Validation Rules**:
1. `targetUrl` must be present and start with `https://` or `tel:` or `http://` or `ftp:` or any valid protocol
2. If `customSlug` provided:
   - Must match regex: `/^[a-zA-Z0-9_-]{4,10}$/`
   - Must not already exist in database
3. If no `customSlug`: Generate 6-character slug
4. Verify generated slug uniqueness (retry if collision)

**Authentication**: Requires Clerk authentication (enforced by proxy.js)

### 4. Analytics API (`app/api/urls/stats/route.js`)

**Purpose**: Log click analytics asynchronously without blocking redirects.

**Endpoint**: `POST /api/urls/stats`

**Request Body**:
```javascript
{
  slug: string,
  referrer?: string,
  userAgent?: string
}
```

**Response** (Success - 200):
```javascript
{
  success: true
}
```

**Operations**:
1. Find ShortUrl by slug
2. Increment `clicks` counter
3. Create ClickLog entry with:
   - `shortUrlId`: Reference to ShortUrl
   - `referrer`: HTTP Referer header value
   - `userAgent`: User-Agent header value
   - `createdAt`: Current timestamp

**Authentication**: None required (public endpoint for analytics)

**Error Handling**: Silently fail if slug not found (don't expose 404s)

### 5. Dashboard Pages

#### Landing Page (`app/page.js`)

**Purpose**: Public landing page with conditional CTAs.

**Content**:
- Project name: "SMRL"
- Description: Brief explanation of the service
- CTA button:
  - If authenticated: "Go to Dashboard" → `/dashboard`
  - If not authenticated: "Sign In" → `/sign-in`

**Authentication**: Public access

#### Dashboard Overview (`app/dashboard/page.js`)

**Purpose**: Display URL shortening statistics and recent URLs.

**Data Displayed**:
1. Total URLs count
2. Total clicks (sum of all ShortUrl.clicks)
3. Latest 5 ShortUrls (ordered by createdAt DESC)
   - Slug
   - Target URL
   - Click count
   - Created date

**Data Fetching**: Server Component with Prisma queries

**Authentication**: Required (Clerk)

#### Create URL Page (`app/dashboard/new/page.js`)

**Purpose**: Interface for creating new short URLs.

**Form Fields**:
1. Long URL (required)
   - Input type: text/url
   - Validation: Must start with https://
2. Custom Slug (optional)
   - Input type: text
   - Validation: 4-10 chars, [a-zA-Z0-9_-]+
   - Placeholder: "Leave blank for auto-generation"
3. Submit button: "Create Short URL"

**Success State**:
- Display generated short URL
- Provide copy-to-clipboard functionality
- Show link to view all URLs

**Error State**:
- Display validation errors inline
- Show duplicate slug errors
- Preserve form input on error

**Authentication**: Required (Clerk)

#### URLs List Page (`app/dashboard/urls/page.js`)

**Purpose**: Display all created short URLs in a table.

**Table Columns**:
1. Slug
2. Target URL (truncated if long)
3. Clicks
4. Created Date

**Sorting**: Newest first (createdAt DESC)

**Data Fetching**: Server Component with Prisma query

**Authentication**: Required (Clerk)

### 6. Prisma Client (`lib/prisma.js`)

**Purpose**: Provide singleton Prisma Client instance with NeonDB adapter.

**Configuration**:
- Uses `@prisma/adapter-pg` for Neon connection pooling
- Singleton pattern to prevent multiple instances
- Development mode: Reuses global instance
- Production mode: Creates new instance per deployment

**Interface**:
```javascript
import prisma from '@/lib/prisma'

// Usage
const shortUrl = await prisma.shortUrl.findUnique({ where: { slug } })
```

## Data Models

### ShortUrl Model

```prisma
model ShortUrl {
  id        String     @id @default(uuid())
  slug      String     @unique
  targetUrl String
  clicks    Int        @default(0)
  createdAt DateTime   @default(now())
  ClickLog  ClickLog[]
}
```

**Fields**:
- `id`: UUID primary key
- `slug`: Unique identifier for the short URL (4-10 chars)
- `targetUrl`: The destination URL (must start with https://)
- `clicks`: Total click count (incremented on each access)
- `createdAt`: Timestamp of creation
- `ClickLog`: One-to-many relation to click logs

**Indexes**:
- Unique index on `slug` for fast lookups
- Index on `createdAt` for sorting recent URLs

### ClickLog Model

```prisma
model ClickLog {
  id         String   @id @default(uuid())
  shortUrlId String
  referrer   String?
  userAgent  String?
  createdAt  DateTime @default(now())
  
  ShortUrl   ShortUrl @relation(fields: [shortUrlId], references: [id])
}
```

**Fields**:
- `id`: UUID primary key
- `shortUrlId`: Foreign key to ShortUrl
- `referrer`: HTTP Referer header (optional)
- `userAgent`: User-Agent string (optional)
- `createdAt`: Timestamp of click
- `ShortUrl`: Many-to-one relation to ShortUrl

**Indexes**:
- Index on `shortUrlId` for efficient click log queries
- Index on `createdAt` for time-based analytics

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Properties 3.5 and 4.3 both test non-blocking redirects (consolidated into Property 5)
- Properties 6.4 and 8.2 both test display of required fields (consolidated into Property 12)
- Properties 4.5 and 10.4 both test referential integrity (consolidated into Property 8)
- Property 2.4 is covered by database constraints and Property 2 (duplicate rejection)

### Core Properties

**Property 1: Valid URL Creation**
*For any* valid target URL starting with https:// or any valid protocol, creating a short URL should result in a ShortUrl record with an auto-generated slug matching the pattern [a-zA-Z0-9_-]+
**Validates: Requirements 1.1, 1.3**

**Property 2: Custom Slug Acceptance**
*For any* valid custom slug (4-10 characters, matching [a-zA-Z0-9_-]+), creating a short URL with that slug should use the custom slug exactly
**Validates: Requirements 1.2, 1.4, 1.5**

**Property 3: Invalid URL Rejection**
*For any* URL not starting with https:// or any valid protocol, the system should reject the creation request with an error
**Validates: Requirements 1.3**

**Property 4: Invalid Slug Rejection**
*For any* custom slug that doesn't match [a-zA-Z0-9_-]+ or is not between 4-10 characters, the system should reject the creation request with an error
**Validates: Requirements 1.4, 1.5**

**Property 5: Redirect Correctness**
*For any* existing short URL, accessing /r/[slug] should return a 302 redirect to the correct target URL without blocking on analytics operations
**Validates: Requirements 3.1, 3.5**

**Property 6: Non-Existent Slug Handling**
*For any* slug that doesn't exist in the database, accessing /r/[slug] should return a custom 404 response
**Validates: Requirements 3.4**

**Property 7: Click Count Increment**
*For any* short URL, each access should increment the clicks counter by exactly 1
**Validates: Requirements 4.1**

**Property 8: Click Log Creation with Referential Integrity**
*For any* short URL access, a ClickLog entry should be created with a valid shortUrlId reference, referrer, userAgent, and timestamp
**Validates: Requirements 4.2, 4.5**

**Property 9: Generated Slug Format**
*For any* short URL created without a custom slug, the generated slug should be exactly 6 characters and match the base64url pattern [a-zA-Z0-9_-]+
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 10: Creation Response Completeness**
*For any* successfully created short URL, the API response should contain the slug, full short URL, target URL, and creation timestamp
**Validates: Requirements 1.7**

**Property 11: Dashboard Statistics Accuracy**
*For any* state of the database, the dashboard should display the correct total count of ShortUrls and the correct sum of all clicks
**Validates: Requirements 6.1, 6.2**

**Property 12: Recent URLs Display**
*For any* database state with N URLs (where N ≥ 5), the dashboard should display exactly the 5 most recently created URLs with all required fields (slug, targetUrl, clicks, createdAt)
**Validates: Requirements 6.3, 6.4**

**Property 13: All URLs Display**
*For any* database state, the /dashboard/urls page should display all ShortUrls ordered by creation date (newest first)
**Validates: Requirements 8.1, 8.3**

**Property 14: Data Structure Completeness**
*For any* created ShortUrl, the record should contain all required fields: id (UUID format), slug, targetUrl, clicks, and createdAt
**Validates: Requirements 10.1, 10.5**

**Property 15: Click Log Structure Completeness**
*For any* created ClickLog, the record should contain all required fields: id (UUID format), shortUrlId, referrer, userAgent, and createdAt
**Validates: Requirements 10.2, 10.5**

### Edge Cases and Examples

These specific scenarios should be tested with example-based unit tests:

**Example 1: Duplicate Slug Rejection**
Creating a short URL with slug "test123", then attempting to create another with the same slug should fail with a descriptive error
**Validates: Requirements 1.6**

**Example 2: Unauthenticated Dashboard Access**
Accessing /dashboard without authentication should redirect to /sign-in
**Validates: Requirements 5.1**

**Example 3: Authenticated Dashboard Access**
Accessing /dashboard with valid authentication should display the dashboard page
**Validates: Requirements 5.2**

**Example 4: Public Landing Page Access**
Accessing / without authentication should display the landing page with project name and "Sign In" CTA
**Validates: Requirements 5.3, 9.1, 9.3**

**Example 5: Public Redirect Access**
Accessing /r/[slug] without authentication should successfully redirect
**Validates: Requirements 5.4**

**Example 6: Unauthenticated Analytics Logging**
Posting to /api/urls/stats without authentication should successfully log analytics
**Validates: Requirements 4.4**

**Example 7: Create Page UI Elements**
The /dashboard/new page should contain input fields for long URL and optional custom slug
**Validates: Requirements 7.1, 7.2**

**Example 8: Creation Success Feedback**
After successfully creating a short URL, the UI should display the generated short URL
**Validates: Requirements 7.4**

**Example 9: Creation Error Feedback**
When creation fails (e.g., invalid URL), the UI should display a descriptive error message
**Validates: Requirements 7.5**

**Example 10: Authenticated Landing Page CTA**
When an authenticated user views /, they should see a "Dashboard" button instead of "Sign In"
**Validates: Requirements 9.2**

## Error Handling

### Validation Errors

**URL Validation**:
- Error: "Target URL must start with https://" or any valid protocols
- HTTP Status: 400 Bad Request
- Trigger: targetUrl doesn't start with "https://" or any valid protocols

**Slug Validation**:
- Error: "Custom slug must be 4-10 characters and contain only letters, numbers, dashes, and underscores"
- HTTP Status: 400 Bad Request
- Trigger: customSlug doesn't match `/^[a-zA-Z0-9_-]{4,10}$/`

**Duplicate Slug**:
- Error: "Slug '[slug]' is already in use"
- HTTP Status: 409 Conflict
- Trigger: Slug already exists in database

### Runtime Errors

**Slug Not Found**:
- Response: Custom 404 Not Found page
- Trigger: Accessing /r/[slug] with non-existent slug

**Database Connection Errors**:
- Error: "Service temporarily unavailable"
- HTTP Status: 503 Service Unavailable
- Trigger: Prisma connection failure
- Handling: Log error, return generic message to user

**Authentication Errors**:
- Response: Redirect to /sign-in
- Trigger: Accessing protected route without valid session
- Handling: Clerk middleware handles automatically

### Analytics Logging Errors

**Silent Failure Strategy**:
- Analytics logging failures should NOT affect redirects
- Log errors server-side for monitoring
- Return success response even if logging fails
- Rationale: Redirect performance is more important than perfect analytics

## Testing Strategy

### Dual Testing Approach

This system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Specific URL formats (with query params, fragments, etc.)
- Boundary conditions (slug length exactly 4 and 10)
- Error messages and HTTP status codes
- UI component rendering
- Authentication flows

**Property-Based Tests**: Verify universal properties across all inputs
- URL creation with random valid/invalid URLs
- Slug generation and validation with random strings
- Redirect behavior with random slugs
- Analytics logging with random data
- Dashboard statistics with random database states

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Framework**: Use `fast-check` for JavaScript property-based testing

**Installation**:
```bash
npm install --save-dev fast-check
```

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `// Feature: url-shortener, Property N: [property text]`

**Example Property Test Structure**:
```javascript
import fc from 'fast-check'

// Feature: url-shortener, Property 1: Valid URL Creation
test('creating short URLs with valid https URLs', () => {
  fc.assert(
    fc.property(
      fc.webUrl({ validSchemes: ['https'] }),
      async (targetUrl) => {
        const result = await createShortUrl({ targetUrl })
        expect(result.slug).toMatch(/^[a-zA-Z0-9_-]+$/)
        expect(result.targetUrl).toBe(targetUrl)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Test Organization

**Unit Tests**:
- Co-locate with source files using `.test.js` suffix
- `lib/slug.test.js` - Slug generation tests
- `app/api/urls/create/route.test.js` - URL creation API tests
- `app/api/urls/stats/route.test.js` - Analytics API tests

**Property Tests**:
- Create dedicated property test files
- `__tests__/properties/url-creation.property.test.js`
- `__tests__/properties/redirects.property.test.js`
- `__tests__/properties/analytics.property.test.js`
- `__tests__/properties/dashboard.property.test.js`

**Integration Tests**:
- Test end-to-end flows
- `__tests__/integration/short-url-flow.test.js` - Create → Redirect → Analytics
- `__tests__/integration/dashboard-flow.test.js` - Auth → Dashboard → Create

### Test Data Generators

For property-based tests, create smart generators:

**Valid HTTPS URL Generator**:
```javascript
const validHttpsUrl = fc.webUrl({ validSchemes: ['https'] })
```

**Valid Slug Generator**:
```javascript
const validSlug = fc.stringMatching(/^[a-zA-Z0-9_-]{4,10}$/)
```

**Invalid Slug Generator**:
```javascript
const invalidSlug = fc.oneof(
  fc.string().filter(s => s.length < 4 || s.length > 10),
  fc.string().filter(s => !/^[a-zA-Z0-9_-]+$/.test(s))
)
```

**ShortUrl Record Generator**:
```javascript
const shortUrlRecord = fc.record({
  id: fc.uuid(),
  slug: validSlug,
  targetUrl: validHttpsUrl,
  clicks: fc.nat(),
  createdAt: fc.date()
})
```

### Testing Priorities

1. **Critical Path** (Must have 100% coverage):
   - Redirect proxy functionality
   - URL creation and validation
   - Slug generation and uniqueness

2. **High Priority**:
   - Analytics logging
   - Dashboard statistics accuracy
   - Authentication flows

3. **Medium Priority**:
   - UI component rendering
   - Error message formatting
   - Edge cases in data display

### Mocking Strategy

**Minimize Mocking**: Test against real Prisma client when possible

**When to Mock**:
- External HTTP requests (if any)
- Clerk authentication in unit tests (use test tokens)
- Time-dependent functions (Date.now())

**When NOT to Mock**:
- Database operations (use test database)
- Slug generation (test real implementation)
- Validation logic (test real validators)

### Performance Testing

While not part of automated test suite, manual performance validation should verify:
- Redirect latency < 100ms (p95)
- Analytics logging doesn't block redirects
- Dashboard loads in < 500ms with 1000+ URLs

## Implementation Notes

### Next.js Proxy File Convention

The redirect proxy must follow Next.js proxy file naming:
- File: `app/r/[...slug]/proxy.js`
- Export: `export async function GET(request, { params })`
- Runtime: `export const runtime = 'edge'`

### Edge Runtime Limitations

The proxy must be edge-compatible:
- No Node.js-specific APIs (fs, path, etc.)
- Use edge-compatible database driver
- Minimal dependencies
- No blocking operations

### Prisma Edge Compatibility

Use `@prisma/adapter-pg` for edge compatibility:
```javascript
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
})

const prisma = new PrismaClient({ adapter })
```

### Fire-and-Forget Analytics

Implement non-blocking analytics:
```javascript
// In proxy.js - DO NOT await
fetch('/api/urls/stats', {
  method: 'POST',
  body: JSON.stringify({ slug, referrer, userAgent })
}).catch(() => {}) // Silent failure

// Immediately redirect
return Response.redirect(targetUrl, 302)
```

### Clerk Authentication Integration

Clerk is already configured via `proxy.js` (root level):
- Protected routes: `/dashboard/**`
- Public routes: `/`, `/sign-in`, `/sign-up`, `/r/**`
- No additional configuration needed

### Database Migrations

After updating schema.prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Security Considerations

1. **URL Validation**: Only allow https:// to prevent XSS via javascript: URLs
2. **Slug Validation**: Strict regex prevents path traversal attacks
3. **Rate Limiting**: Consider adding rate limiting to creation API (not in MVP)
4. **Analytics Privacy**: Don't log IP addresses (GDPR compliance)
5. **Error Messages**: Don't expose internal errors to users

### Scalability Considerations

For future scaling (beyond MVP):
1. **Caching**: Add Redis cache for hot slugs
2. **CDN**: Deploy proxy to edge locations globally
3. **Database**: Use read replicas for analytics queries
4. **Monitoring**: Add observability for redirect latency
5. **Archiving**: Archive old ClickLog entries

These are NOT required for initial implementation but should be considered in architecture.
