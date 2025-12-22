# Implementation Plan: URL Shortener

## Overview

This plan implements a self-hosted, single-user URL shortener using Next.js 16 (App Router), JavaScript, Prisma 7, NeonDB, and Clerk authentication. The implementation prioritizes redirect performance through Next.js Proxy architecture with fire-and-forget analytics logging.

## Tasks

- [x] 1. Update Prisma schema and generate client
  - Update `prisma/schema.prisma` with ShortUrl and ClickLog models
  - Ensure generator output path matches existing configuration
  - Run `npm run prisma:generate` to generate Prisma Client
  - Run `npm run prisma:migrate` to create database tables
  - _Requirements: 10.1, 10.2, 10.5_

- [ ] 2. Implement slug generation utility
  - [x] 2.1 Create `lib/slug.js` with generateSlug function
    - Use crypto.randomBytes for cryptographic randomness
    - Encode with base64url and slice to requested length
    - Default length: 6 characters
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 2.2 Write property test for slug generation
    - **Property 9: Generated Slug Format**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Test that generated slugs are 6 characters and match [a-zA-Z0-9_-]+
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Implement URL creation API
  - [x] 3.1 Create `app/api/urls/create/route.js`
    - Validate targetUrl starts with https://
    - Validate customSlug format and length (4-10 chars, [a-zA-Z0-9_-]+)
    - Generate slug if not provided using lib/slug.js
    - Check for duplicate slugs and return 409 if exists
    - Save to database via Prisma
    - Return slug, full short URL, targetUrl, and createdAt
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ] 3.2 Write property test for valid URL creation
    - **Property 1: Valid URL Creation**
    - **Validates: Requirements 1.1, 1.3**
    - Generate random https:// URLs and verify ShortUrl creation
    - _Requirements: 1.1, 1.3_
  
  - [ ] 3.3 Write property test for custom slug acceptance
    - **Property 2: Custom Slug Acceptance**
    - **Validates: Requirements 1.2, 1.4, 1.5**
    - Generate random valid custom slugs and verify they're used
    - _Requirements: 1.2, 1.4, 1.5_
  
  - [ ] 3.4 Write property test for invalid URL rejection
    - **Property 3: Invalid URL Rejection**
    - **Validates: Requirements 1.3**
    - Generate URLs with non-https protocols and verify rejection
    - _Requirements: 1.3_
  
  - [ ] 3.5 Write property test for invalid slug rejection
    - **Property 4: Invalid Slug Rejection**
    - **Validates: Requirements 1.4, 1.5**
    - Generate invalid slugs and verify rejection
    - _Requirements: 1.4, 1.5_
  
  - [ ] 3.6 Write unit test for duplicate slug rejection
    - **Example 1: Duplicate Slug Rejection**
    - **Validates: Requirements 1.6**
    - Create slug, attempt duplicate, verify error
    - _Requirements: 1.6_
  
  - [ ] 3.7 Write property test for creation response completeness
    - **Property 10: Creation Response Completeness**
    - **Validates: Requirements 1.7**
    - Verify response contains all required fields
    - _Requirements: 1.7_

- [ ] 4. Checkpoint - Ensure URL creation works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement redirect proxy
  - [x] 5.1 Create `app/r/[...slug]/proxy.js`
    - Set runtime to 'edge'
    - Extract slug from params
    - Query database for ShortUrl by slug
    - If found: return 302 redirect to targetUrl
    - If not found: return 404 response
    - Trigger fire-and-forget analytics call (don't await)
    - _Requirements: 3.1, 3.4, 3.5_
  
  - [ ] 5.2 Write property test for redirect correctness
    - **Property 5: Redirect Correctness**
    - **Validates: Requirements 3.1, 3.5**
    - Create random short URLs and verify correct redirects
    - Verify redirects don't block on analytics
    - _Requirements: 3.1, 3.5_
  
  - [ ] 5.3 Write property test for non-existent slug handling
    - **Property 6: Non-Existent Slug Handling**
    - **Validates: Requirements 3.4**
    - Test random non-existent slugs return 404
    - _Requirements: 3.4_
  
  - [ ] 5.4 Write unit test for public redirect access
    - **Example 5: Public Redirect Access**
    - **Validates: Requirements 5.4**
    - Verify redirects work without authentication
    - _Requirements: 5.4_

- [ ] 6. Implement analytics logging API
  - [x] 6.1 Create `app/api/urls/stats/route.js`
    - Accept slug, referrer, userAgent in request body
    - Find ShortUrl by slug
    - Increment clicks counter
    - Create ClickLog entry with shortUrlId, referrer, userAgent, timestamp
    - Return success response
    - Handle errors silently (don't expose 404s)
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [ ] 6.2 Write property test for click count increment
    - **Property 7: Click Count Increment**
    - **Validates: Requirements 4.1**
    - Verify each access increments clicks by 1
    - _Requirements: 4.1_
  
  - [ ] 6.3 Write property test for click log creation
    - **Property 8: Click Log Creation with Referential Integrity**
    - **Validates: Requirements 4.2, 4.5**
    - Verify ClickLog entries are created with valid references
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.4 Write unit test for unauthenticated analytics
    - **Example 6: Unauthenticated Analytics Logging**
    - **Validates: Requirements 4.4**
    - Verify analytics endpoint works without auth
    - _Requirements: 4.4_

- [ ] 7. Checkpoint - Ensure redirect and analytics work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement landing page
  - [x] 8.1 Update `app/page.js` with landing page content
    - Display project name "URL Shortener"
    - Display brief description
    - Show "Go to Dashboard" button if authenticated (link to /dashboard)
    - Show "Sign In" button if not authenticated (link to /sign-in)
    - Use Clerk's useAuth or auth() to check authentication status
    - _Requirements: 9.1, 9.2, 9.3, 5.3_
  
  - [ ] 8.2 Write unit test for public landing page access
    - **Example 4: Public Landing Page Access**
    - **Validates: Requirements 5.3, 9.1, 9.3**
    - Verify landing page accessible without auth
    - _Requirements: 5.3, 9.1, 9.3_
  
  - [ ] 8.3 Write unit test for authenticated landing page CTA
    - **Example 10: Authenticated Landing Page CTA**
    - **Validates: Requirements 9.2**
    - Verify "Dashboard" button shown when authenticated
    - _Requirements: 9.2_

- [ ] 9. Implement dashboard overview page
  - [x] 9.1 Create `app/dashboard/page.js`
    - Fetch total count of ShortUrls
    - Fetch sum of all clicks
    - Fetch 5 most recent ShortUrls (ordered by createdAt DESC)
    - Display statistics and recent URLs table
    - Show slug, targetUrl, clicks, createdAt for each URL
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 9.2 Write property test for dashboard statistics accuracy
    - **Property 11: Dashboard Statistics Accuracy**
    - **Validates: Requirements 6.1, 6.2**
    - Create random URLs with clicks and verify correct totals
    - _Requirements: 6.1, 6.2_
  
  - [ ] 9.3 Write property test for recent URLs display
    - **Property 12: Recent URLs Display**
    - **Validates: Requirements 6.3, 6.4**
    - Create multiple URLs and verify correct 5 shown with all fields
    - _Requirements: 6.3, 6.4_
  
  - [ ] 9.4 Write unit test for authenticated dashboard access
    - **Example 3: Authenticated Dashboard Access**
    - **Validates: Requirements 5.2**
    - Verify dashboard accessible with authentication
    - _Requirements: 5.2_
  
  - [ ] 9.5 Write unit test for unauthenticated dashboard redirect
    - **Example 2: Unauthenticated Dashboard Access**
    - **Validates: Requirements 5.1**
    - Verify redirect to sign-in without authentication
    - _Requirements: 5.1_

- [ ] 10. Implement URL creation page
  - [x] 10.1 Create `app/dashboard/new/page.js`
    - Create form with long URL input (required)
    - Create form with custom slug input (optional)
    - Add submit button "Create Short URL"
    - On submit: call /api/urls/create
    - On success: display generated short URL with copy button
    - On error: display error message inline
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [ ] 10.2 Write unit test for create page UI elements
    - **Example 7: Create Page UI Elements**
    - **Validates: Requirements 7.1, 7.2**
    - Verify page contains required input fields
    - _Requirements: 7.1, 7.2_
  
  - [ ] 10.3 Write unit test for creation success feedback
    - **Example 8: Creation Success Feedback**
    - **Validates: Requirements 7.4**
    - Verify short URL displayed after creation
    - _Requirements: 7.4_
  
  - [ ] 10.4 Write unit test for creation error feedback
    - **Example 9: Creation Error Feedback**
    - **Validates: Requirements 7.5**
    - Verify error messages displayed on failure
    - _Requirements: 7.5_

- [ ] 11. Implement URLs list page
  - [ ] 11.1 Create `app/dashboard/urls/page.js`
    - Fetch all ShortUrls ordered by createdAt DESC
    - Display table with columns: Slug, Target URL, Clicks, Created Date
    - Truncate long URLs for display
    - _Requirements: 8.1, 8.3_
  
  - [ ] 11.2 Write property test for all URLs display
    - **Property 13: All URLs Display**
    - **Validates: Requirements 8.1, 8.3**
    - Create random number of URLs and verify all shown in correct order
    - _Requirements: 8.1, 8.3_

- [ ] 12. Checkpoint - Ensure all dashboard pages work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Write property tests for data structure completeness
  - [ ] 13.1 Write property test for ShortUrl structure
    - **Property 14: Data Structure Completeness**
    - **Validates: Requirements 10.1, 10.5**
    - Verify all ShortUrl records have required fields with correct types
    - _Requirements: 10.1, 10.5_
  
  - [ ] 13.2 Write property test for ClickLog structure
    - **Property 15: Click Log Structure Completeness**
    - **Validates: Requirements 10.2, 10.5**
    - Verify all ClickLog records have required fields with correct types
    - _Requirements: 10.2, 10.5_

- [ ] 14. Write integration tests
  - [ ] 14.1 Write integration test for complete short URL flow
    - Test: Create URL → Access redirect → Verify analytics logged
    - _Requirements: 1.1, 3.1, 4.1, 4.2_
  
  - [ ] 14.2 Write integration test for dashboard flow
    - Test: Authenticate → View dashboard → Create URL → View in list
    - _Requirements: 5.2, 6.1, 7.3, 8.1_

- [ ] 15. Final checkpoint - Complete system verification
  - Run all tests and ensure they pass
  - Manually test redirect performance
  - Verify authentication flows work correctly
  - Ask the user if any issues or questions arise

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows
- The Prisma schema must be updated before any database operations
- All dashboard routes are automatically protected by Clerk via existing proxy.js
- Redirect proxy must use Edge Runtime for performance
- Analytics logging must be fire-and-forget (non-blocking)
