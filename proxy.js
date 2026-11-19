import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/r(.*)',
  '/api/urls/stats',
  '/unauthorized(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId } = await auth()

    if (!userId) {
      await auth.protect()
      return
    }

    const allowedUserId = process.env.ALLOWED_USER_ID
    if (allowedUserId && userId !== allowedUserId) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You are not authorized to use this application." }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      const unauthorizedUrl = new URL('/unauthorized', req.url)
      return Response.redirect(unauthorizedUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
