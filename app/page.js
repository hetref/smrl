import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Link2,
  Zap,
  ShieldCheck,
  QrCode as QrIcon,
  ArrowRight,
  ExternalLink,
  Lock,
  BarChart3,
  Terminal,
  Layers,
  Sparkles,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  const allowedUserId = process.env.ALLOWED_USER_ID;
  const isAllowed = userId && (!allowedUserId || userId === allowedUserId);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-100 flex flex-col selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/80 transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-sm dark:bg-white dark:text-black">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">SMRL</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/hetref/smrl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors hidden sm:block"
            >
              GitHub
            </a>

            {userId ? (
              isAllowed ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Link
                  href="/unauthorized"
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                >
                  Switch Account
                </Link>
              )
            ) : (
              <Link
                href="/sign-in"
                className="rounded-2xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-[11px] font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 mb-6">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Self-Hosted & Private URL Shortening Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08] mb-6">
          Your branded links. <br className="hidden sm:block" />
          Zero third-party baggage.
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
          A high-performance URL shortener built on Next.js 16, Neon PostgreSQL, and Clerk. Custom slugs, instant redirects, background analytics, and strict password security.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-14">
          {userId ? (
            isAllowed ? (
              <Link
                href="/dashboard"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/unauthorized"
                className="w-full sm:w-auto rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-rose-700"
              >
                Access Restricted
              </Link>
            )
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <span>Sign In to Instance</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          <a
            href="https://github.com/hetref/smrl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <span>Star on GitHub</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Visual Transformation Mockup */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-left max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              How it redirects
            </span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              ~35ms HTTP 302
            </span>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
              <span className="shrink-0 text-zinc-400 text-[10px] uppercase font-sans font-semibold">
                Short:
              </span>
              <span className="text-zinc-950 dark:text-white font-semibold truncate">
                https://yourdomain.com/r/launch
              </span>
            </div>

            <div className="flex items-center justify-center text-zinc-400 py-0.5">
              <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
              <span className="shrink-0 text-zinc-400 text-[10px] uppercase font-sans font-semibold">
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Built for speed, clarity, and control
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Full control over your link redirects without subscriptions or third-party trackers.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-2">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Native Background Analytics
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Redirects fire immediately with HTTP 302. Next.js 16’s native <code className="font-mono text-zinc-700 dark:text-zinc-300">after()</code> logs referrers and clicks in the background without dropping requests.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Single-Admin Security
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Protected by Clerk authentication and strict environment variable gating (<code className="font-mono text-zinc-700 dark:text-zinc-300">ALLOWED_USER_ID</code>). Unauthorized accounts cannot access your management dashboard.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-2">
              <QrIcon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Instant QR Codes & Gates
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generate crisp QR codes with 1-click downloads. Configure password protection with scrypt hashing, time expirations, and traffic capacity limits.
            </p>
          </div>
        </div>
      </section>

      {/* Deployment Cards */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vercel Deploy */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 text-center flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white mb-2">
                Deploy to Vercel
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Host on Vercel’s free tier with automated HTTPS, edge routing, and global serverless CDN.
              </p>
            </div>
            <a
              href="https://vercel.com/new/import?repository-name=smrl&s=https://github.com/hetref/smrl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <span>Deploy with Vercel</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Docker / Local Self-Host */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Self-Host Anywhere
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                Clone the repository and run it on your own server or VPS.
              </p>
            </div>
            <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-3.5 text-[11px] font-mono text-zinc-300">
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
          <p className="font-mono text-[11px]">
            © {new Date().getFullYear()} SMRL · Self-Hosted URL Infrastructure
          </p>
          <p className="text-[11px]">
            Engineered by{" "}
            <a
              href="https://aryanshinde.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-950 hover:underline dark:text-white"
            >
              Aryan Shinde
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
