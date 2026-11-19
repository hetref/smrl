import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const allowedUserId = process.env.ALLOWED_USER_ID;
  const isAllowed = userId && (!allowedUserId || userId === allowedUserId);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-100 flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shadow-sm dark:bg-white dark:text-black">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">SMRL</span>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/hetref/smrl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors hidden sm:block"
            >
              GitHub
            </a>

            {userId ? (
              isAllowed ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <Link
                  href="/unauthorized"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Switch Account
                </Link>
              )
            ) : (
              <Link
                href="/sign-in"
                className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-[11px] font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 mb-6">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Self-Hosted & Private URL Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black dark:text-white leading-[1.1] mb-6">
          Your links. Your domain. <br className="hidden sm:block" />
          Zero third-party baggage.
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
          A lightweight, private URL shortener built on Next.js 16, Neon PostgreSQL, and Clerk. Create custom slugs, instant redirects, and real-time visitor analytics.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
          {userId ? (
            isAllowed ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Launch Dashboard →
              </Link>
            ) : (
              <Link
                href="/unauthorized"
                className="w-full sm:w-auto rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-700"
              >
                Access Restricted
              </Link>
            )
          ) : (
            <Link
              href="/sign-in"
              className="w-full sm:w-auto rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In to Your Instance
            </Link>
          )}

          <a
            href="https://github.com/hetref/smrl"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Star on GitHub ↗
          </a>
        </div>

        {/* Interactive Visual Transformation Mockup */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-left max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              How it redirects
            </span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              ⚡ ~35ms HTTP 302
            </span>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
              <span className="shrink-0 text-zinc-400 text-[10px] uppercase font-sans">
                Short:
              </span>
              <span className="text-black dark:text-white font-semibold truncate">
                https://yourdomain.com/r/launch
              </span>
            </div>

            <div className="flex items-center justify-center text-zinc-400 py-0.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
              <span className="shrink-0 text-zinc-400 text-[10px] uppercase font-sans">
                Target:
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 truncate">
                https://mycompany.com/products/annual-launch-keynote-announcement-2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
            Built for speed, clarity, and control
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need in a modern link shortener without tracking scripts or monthly subscription fees.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Native Background Analytics
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Redirects fire immediately with HTTP 302. Next.js 16’s native <code className="font-mono text-zinc-700 dark:text-zinc-300">after()</code> logs referrers and clicks in the background without latency.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Single-Admin Security
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Guarded by Clerk authentication and strict environment variable gating (<code className="font-mono text-zinc-700 dark:text-zinc-300">ALLOWED_USER_ID</code>). Unauthorized visitors cannot access your dashboard.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Instant QR Codes & Stats
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generate crisp QR codes for any link with 1-click PNG downloads. View device, browser, and timeline activity directly on the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Deployment Options Section */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vercel Deploy */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 text-center flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white mb-2">
                Deploy to Vercel
              </h3>
              <p className="text-xs text-zinc-500 mb-6">
                Host on Vercel’s free tier with automated HTTPS, edge routing, and global serverless CDN.
              </p>
            </div>
            <a
              href="https://vercel.com/new/import?repository-name=smrl&s=https://github.com/hetref/smrl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 76 76"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
              </svg>
              Deploy with Vercel ↗
            </a>
          </div>

          {/* Docker Self-Host */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white mb-2">
                Self-Host Anywhere
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Clone the repository and run it on your own server or Docker container.
              </p>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-[11px] font-mono text-zinc-300">
              <code>{`git clone https://github.com/hetref/smrl.git
cd smrl && npm install
npm run dev`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-500">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SMRL · Self-Hosted URL Shortener</p>
          <p>
            Engineered by{" "}
            <a
              href="https://aryanshinde.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black hover:underline dark:text-white"
            >
              Aryan Shinde
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
