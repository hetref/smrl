# Requirements Document

## Introduction

A self-hosted, single-user URL shortener system built with Next.js, Prisma 7, NeonDB (Postgres), and Clerk authentication. The system allows an authenticated user to create short URLs that redirect to target URLs with click analytics tracking. Redirect performance is the top priority, achieved through Next.js Proxy architecture.

## Glossary

- **System**: The URL shortener application
- **Short_URL**: A shortened URL consisting of a slug that redirects to a target URL
- **Slug**: A unique identifier (4-10 characters, alphanumeric with dashes/underscores) used in short URLs
- **Target_URL**: The original long URL that a short URL redirects to
- **Dashboard**: The authenticated area where users manage their short URLs
- **Proxy**: Next.js proxy file that handles redirect requests at the edge
- **Click_Analytics**: Tracking data including click counts, referrers, and user agents
- **Clerk**: Third-party authentication service handling user authentication

## Requirements

### Requirement 1: URL Shortening

**User Story:** As a user, I want to create short URLs from long URLs, so that I can share compact links.

#### Acceptance Criteria

1. WHEN a user submits a valid target URL, THE System SHALL create a Short_URL with an auto-generated Slug
2. WHERE a custom Slug is provided, THE System SHALL use the custom Slug if it meets validation rules
3. THE System SHALL only accept target URLs starting with https://
4. THE System SHALL validate custom Slugs against the regex pattern [a-zA-Z0-9_-]+
5. THE System SHALL enforce Slug length between 4 and 10 characters
6. IF a duplicate Slug is submitted, THEN THE System SHALL reject the creation and return an error
7. WHEN a Short_URL is created, THE System SHALL return the Slug, full short URL, and creation timestamp

### Requirement 2: Slug Generation

**User Story:** As a user, I want automatically generated slugs to be unique and URL-safe, so that my short URLs work reliably.

#### Acceptance Criteria

1. WHEN no custom Slug is provided, THE System SHALL generate a 6-character Slug using cryptographically random bytes
2. THE System SHALL encode generated Slugs using base64url encoding
3. THE System SHALL ensure generated Slugs match the pattern [a-zA-Z0-9_-]+
4. THE System SHALL verify Slug uniqueness before saving to the database

### Requirement 3: Fast URL Redirection

**User Story:** As an end user, I want short URLs to redirect instantly, so that I have a seamless experience.

#### Acceptance Criteria

1. WHEN a user accesses a Short_URL via /r/[slug], THE System SHALL redirect to the Target_URL using a 302 redirect
2. THE System SHALL use Next.js Proxy architecture for redirect handling
3. THE System SHALL execute redirects at the edge for maximum performance
4. IF a Slug does not exist, THEN THE System SHALL return a 404 response
5. THE System SHALL NOT block redirects on analytics logging operations
6. THE System SHALL complete redirects without waiting for database write operations

### Requirement 4: Click Analytics Tracking

**User Story:** As a user, I want to track clicks on my short URLs, so that I can understand link usage.

#### Acceptance Criteria

1. WHEN a Short_URL is accessed, THE System SHALL increment the click count for that Short_URL
2. WHEN a Short_URL is accessed, THE System SHALL create a Click_Log entry with referrer, user agent, and timestamp
3. THE System SHALL perform analytics logging asynchronously without blocking redirects
4. THE System SHALL accept analytics data without requiring authentication
5. THE System SHALL store Click_Log entries with references to their parent Short_URL

### Requirement 5: Dashboard Access Control

**User Story:** As the system owner, I want dashboard access restricted to authenticated users, so that my URL management remains private.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access /dashboard/**, THEN THE System SHALL redirect to the sign-in page
2. WHEN an authenticated user accesses /dashboard/**, THE System SHALL display the requested dashboard page
3. THE System SHALL allow public access to the root landing page
4. THE System SHALL allow public access to short URL redirects via /r/[slug]
5. THE System SHALL use Clerk for authentication without custom user tables

### Requirement 6: Dashboard Overview

**User Story:** As a user, I want to see an overview of my URL shortening activity, so that I can monitor usage at a glance.

#### Acceptance Criteria

1. WHEN a user accesses /dashboard, THE System SHALL display the total count of Short_URLs
2. WHEN a user accesses /dashboard, THE System SHALL display the total count of clicks across all Short_URLs
3. WHEN a user accesses /dashboard, THE System SHALL display the 5 most recently created Short_URLs
4. THE System SHALL display Short_URL information including Slug, Target_URL, click count, and creation date

### Requirement 7: URL Creation Interface

**User Story:** As a user, I want a simple interface to create short URLs, so that I can quickly generate links.

#### Acceptance Criteria

1. WHEN a user accesses /dashboard/new, THE System SHALL display an input field for the long URL
2. WHEN a user accesses /dashboard/new, THE System SHALL display an optional input field for a custom Slug
3. WHEN a user submits the creation form, THE System SHALL validate the inputs and create the Short_URL
4. WHEN a Short_URL is successfully created, THE System SHALL display the generated short URL to the user
5. IF creation fails, THEN THE System SHALL display a descriptive error message

### Requirement 8: URL Management View

**User Story:** As a user, I want to view all my short URLs in one place, so that I can review my created links.

#### Acceptance Criteria

1. WHEN a user accesses /dashboard/urls, THE System SHALL display a table of all Short_URLs
2. THE System SHALL display Slug, Target_URL, click count, and creation date for each Short_URL
3. THE System SHALL order Short_URLs by creation date with newest first

### Requirement 9: Landing Page

**User Story:** As a visitor, I want to understand what the application does, so that I know whether to sign in.

#### Acceptance Criteria

1. WHEN a user accesses the root path /, THE System SHALL display the project name and description
2. WHEN an authenticated user views the landing page, THE System SHALL display a "Dashboard" call-to-action button
3. WHEN an unauthenticated user views the landing page, THE System SHALL display a "Sign In" call-to-action button

### Requirement 10: Data Persistence

**User Story:** As a user, I want my short URLs and analytics data stored reliably, so that I don't lose my data.

#### Acceptance Criteria

1. THE System SHALL store Short_URL records with id, slug, targetUrl, clicks, and createdAt fields
2. THE System SHALL store Click_Log records with id, shortUrlId, referrer, userAgent, and createdAt fields
3. THE System SHALL use Prisma 7 with NeonDB (Postgres) for data persistence
4. THE System SHALL maintain referential integrity between Click_Log and Short_URL records
5. THE System SHALL use UUID for primary keys
