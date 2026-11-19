"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Link2, Plus, LayoutDashboard, ListFilter } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/urls", label: "All Links", icon: ListFilter },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-950 transition-opacity hover:opacity-85 dark:text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-sm dark:bg-white dark:text-black">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">SMRL</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Admin
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(link.href);

              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA & Account */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Link</span>
          </Link>

          <div className="flex items-center pl-1 border-l border-zinc-200 dark:border-zinc-800">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 rounded-xl",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
