# SMRL - URL Shortener

A self-hosted, single-user URL shortener built with Next.js 16, Prisma 7, NeonDB (Postgres), and Clerk authentication.

## Features

✅ **Fast URL Shortening** - Create short URLs with auto-generated or custom slugs
✅ **Click Analytics** - Track clicks, referrers, and user agents
✅ **Custom Slugs** - Use your own slugs (4-10 characters)
✅ **Dashboard** - View statistics and manage your URLs
✅ **Secure** - Protected dashboard with Clerk authentication
✅ **Fast Redirects** - Optimized redirect performance with fire-and-forget analytics

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: NeonDB (PostgreSQL) with Prisma 7
- **Authentication**: Clerk
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A NeonDB account and database
- A Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

   # NeonDB
   DATABASE_URL=your_neondb_connection_string
   ```

4. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
smrl/
├── app/
│   ├── api/
│   │   └── urls/
│   │       ├── create/route.js    # URL creation API
│   │       └── stats/route.js     # Analytics logging API
│   ├── dashboard/
│   │   ├── page.js                # Dashboard overview
│   │   ├── new/page.js            # Create new URL
│   │   └── urls/page.js           # List all URLs
│   ├── r/
│   │   └── [...slug]/route.js     # Redirect handler (uses Response.redirect)
│   ├── sign-in/                   # Clerk sign-in
│   ├── sign-up/                   # Clerk sign-up
│   ├── layout.js                  # Root layout
│   ├── page.js                    # Landing page
│   └── not-found.js               # 404 page
├── lib/
│   ├── prisma.js                  # Prisma client
│   └── slug.js                    # Slug generator
├── prisma/
│   └── schema.prisma              # Database schema
├── proxy.js                       # Clerk middleware
└── .kiro/specs/url-shortener/     # Specification documents
```

## Usage

### Creating a Short URL

1. Sign in to your account
2. Navigate to the dashboard
3. Click "Create Short URL"
4. Enter your long URL (must start with https://)
5. Optionally, provide a custom slug (4-10 characters, alphanumeric with dashes/underscores)
6. Click "Create Short URL"
7. Copy your short URL and share it!

### Viewing Analytics

- **Dashboard**: View total URLs and total clicks
- **Recent URLs**: See your 5 most recently created URLs
- **All URLs**: View complete list with click counts and creation dates

### Using Short URLs

Short URLs follow the format: `https://yourdomain.com/r/[slug]`

When accessed:
- Users are instantly redirected to the target URL
- Click analytics are logged asynchronously (non-blocking)
- No authentication required for redirects

## API Endpoints

### POST /api/urls/create
Create a new short URL (requires authentication)

**Request:**
```json
{
  "targetUrl": "https://example.com/long/url",
  "customSlug": "my-link" // optional
}
```

**Response:**
```json
{
  "slug": "my-link",
  "shortUrl": "https://yourdomain.com/r/my-link",
  "targetUrl": "https://example.com/long/url",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/urls/stats
Log analytics for a short URL (public endpoint)

**Request:**
```json
{
  "slug": "my-link",
  "referrer": "https://referrer.com",
  "userAgent": "Mozilla/5.0..."
}
```

### GET /r/[slug]
Redirect to target URL (public endpoint)

## Database Schema

### ShortUrl
- `id` (UUID) - Primary key
- `slug` (String) - Unique slug identifier
- `targetUrl` (String) - Target URL
- `clicks` (Int) - Total click count
- `createdAt` (DateTime) - Creation timestamp

### ClickLog
- `id` (UUID) - Primary key
- `shortUrlId` (String) - Foreign key to ShortUrl
- `referrer` (String?) - HTTP Referer header
- `userAgent` (String?) - User-Agent string
- `createdAt` (DateTime) - Click timestamp

## Deployment

### Docker (Self-Hosted)

The easiest way to self-host SMRL is using Docker:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smrl
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Run database migrations**
   ```bash
   docker compose run smrl npx prisma migrate deploy
   ```

4. **Start the application**
   ```bash
   docker compose up --build
   ```

5. **Access the app**
   - Open [http://localhost:3000](http://localhost:3000)

**Docker Commands:**
```bash
# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down

# Rebuild after code changes
docker compose up --build
```

**Important Notes:**
- The Docker setup connects to your external NeonDB instance
- Migrations must be run manually (not automated)
- The production build is optimized and uses Node.js 20 LTS

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Self-hosted with Docker

## Security Considerations

- ✅ Only HTTPS URLs are accepted (prevents XSS)
- ✅ Strict slug validation (prevents path traversal)
- ✅ Dashboard protected by Clerk authentication
- ✅ Analytics endpoint is public (by design)
- ✅ No IP address logging (GDPR compliant)

## Performance

- **Redirect Speed**: Optimized for sub-100ms redirects
- **Fire-and-Forget Analytics**: Analytics logging doesn't block redirects
- **Database Indexing**: Optimized queries with proper indexes
- **Edge-Ready**: Can be deployed to edge locations for global performance

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
