"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  QrCode as QrIcon,
  Edit3,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Lock,
  Unlock,
  Clock,
  Ban,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import CopyButton from "../../CopyButton";
import QrModal from "../../QrModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import { useToast } from "@/app/components/ToastContext";

function parseUserAgent(ua) {
  if (!ua) return { device: "Unknown", browser: "Unknown", os: "Unknown" };

  let device = "Desktop";
  if (/mobile|android|iphone|ipod/i.test(ua)) device = "Mobile";
  else if (/ipad|tablet/i.test(ua)) device = "Tablet";

  let browser = "Other";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

function cleanReferrer(ref) {
  if (!ref) return "Direct / None";
  try {
    const parsed = new URL(ref);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return ref.slice(0, 30);
  }
}

export default function StatsClientView({ url, logs }) {
  const [showQr, setShowQr] = useState(false);
  const [currentClicks, setCurrentClicks] = useState(url.clicks);
  const [currentLogs, setCurrentLogs] = useState(logs);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { success, error } = useToast();

  const handleResetClicks = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/urls/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: url.id,
          resetClicks: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reset clicks");
      }

      setCurrentClicks(0);
      setCurrentLogs([]);
      success("Clicks counter reset", `Clicks for /${url.slug} reset to 0.`);
      setIsResetModalOpen(false);
    } catch (err) {
      error("Reset failed", err.message || "Could not reset clicks.");
    } finally {
      setIsResetting(false);
    }
  };

  // Group by day for the chart
  const timelineData = useMemo(() => {
    const daysMap = {};
    const now = new Date();

    // Initialize last 14 days with 0
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      daysMap[key] = 0;
    }

    currentLogs.forEach((log) => {
      const key = log.createdAt.split("T")[0];
      if (daysMap[key] !== undefined) {
        daysMap[key] += 1;
      } else {
        daysMap[key] = (daysMap[key] || 0) + 1;
      }
    });

    const entries = Object.entries(daysMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14);

    const maxCount = Math.max(...entries.map(([, count]) => count), 1);

    return { entries, maxCount };
  }, [currentLogs]);

  // Referrer breakdown
  const referrers = useMemo(() => {
    const counts = {};
    currentLogs.forEach((log) => {
      const ref = cleanReferrer(log.referrer);
      counts[ref] = (counts[ref] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / (currentLogs.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [currentLogs]);

  // Device & Platform breakdown
  const deviceStats = useMemo(() => {
    const devices = {};
    const browsers = {};
    const osList = {};

    currentLogs.forEach((log) => {
      const parsed = parseUserAgent(log.userAgent);
      devices[parsed.device] = (devices[parsed.device] || 0) + 1;
      browsers[parsed.browser] = (browsers[parsed.browser] || 0) + 1;
      osList[parsed.os] = (osList[parsed.os] || 0) + 1;
    });

    const format = (dict) =>
      Object.entries(dict)
        .map(([name, count]) => ({
          name,
          count,
          percent: Math.round((count / (currentLogs.length || 1)) * 100),
        }))
        .sort((a, b) => b.count - a.count);

    return {
      devices: format(devices),
      browsers: format(browsers),
      os: format(osList),
    };
  }, [currentLogs]);

  return (
    <div className="space-y-8">
      {/* URL Header Card */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                /{url.slug}
              </span>
              <a
                href={`/r/${url.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:text-zinc-950 dark:border-zinc-800 dark:hover:text-white transition-colors"
                title="Open short link"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <CopyButton slug={url.slug} />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="shrink-0">Destination:</span>
              <a
                href={url.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white underline underline-offset-2"
                title={url.targetUrl}
              >
                {url.targetUrl}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
              title="Reset click count to 0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Clicks</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <QrIcon className="h-3.5 w-3.5" />
              <span>QR Code</span>
            </button>
            <Link
              href={`/dashboard/urls/${url.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Link</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Total Clicks
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {currentClicks.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Recorded since creation/reset
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Top Referrer
          </p>
          <p className="mt-2 text-2xl font-bold truncate text-zinc-950 dark:text-white">
            {referrers[0]?.name || "Direct / None"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {referrers[0]
              ? `${referrers[0].count} clicks (${referrers[0].percent}%)`
              : "No traffic data yet"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Top Device
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {deviceStats.devices[0]?.name || "N/A"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {deviceStats.devices[0]
              ? `${deviceStats.devices[0].percent}% of traffic`
              : "Awaiting visitors"}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/90 bg-white p-5.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Created Date
          </p>
          <p className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">
            {new Date(url.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {new Date(url.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Security & Access Policies Status Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Link Status
          </span>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${
              url.isActive
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                url.isActive ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {url.isActive ? "Active (Accepting Visits)" : "Paused (Blocked)"}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Password Gate
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 dark:text-white">
            {url.isPasswordProtected ? (
              <>
                <Lock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                Password Protected
              </>
            ) : (
              <>
                <Unlock className="h-3.5 w-3.5 text-zinc-400" />
                Open Redirect
              </>
            )}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Expiration Policy
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-950 dark:text-white truncate">
            {url.expiresAt ? (
              <>
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                {new Date(url.expiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            ) : (
              "Never Expires"
            )}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Click Capacity
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-950 dark:text-white">
            {url.maxClicks ? (
              <>
                <Ban className="h-3.5 w-3.5 text-blue-500" />
                {currentClicks} / {url.maxClicks} max clicks
              </>
            ) : (
              "Unlimited Clicks"
            )}
          </span>
        </div>
      </div>

      {/* 14-Day Timeline Bar Chart */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
            Clicks Over the Last 14 Days
          </h3>
          <p className="text-[11px] text-zinc-500">
            Daily redirection volume recorded.
          </p>
        </div>

        {timelineData.entries.length === 0 || currentClicks === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-zinc-400">
            No clicks recorded yet (or counter was reset).
          </div>
        ) : (
          <div className="pt-4">
            <div className="flex h-44 items-end gap-2 sm:gap-3 border-b border-zinc-100 pb-2 dark:border-zinc-800">
              {timelineData.entries.map(([day, count]) => {
                const heightPercent = Math.max(
                  Math.round((count / timelineData.maxCount) * 100),
                  count > 0 ? 8 : 2
                );
                const dayLabel = new Date(day + "T00:00:00").toLocaleDateString(undefined, {
                  month: "numeric",
                  day: "numeric",
                });

                return (
                  <div
                    key={day}
                    className="group relative flex flex-1 flex-col items-center justify-end h-full"
                  >
                    {/* Hover Tooltip */}
                    <div className="pointer-events-none absolute -top-8 hidden rounded-lg bg-black px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block dark:bg-white dark:text-black z-10 whitespace-nowrap">
                      {count} click{count === 1 ? "" : "s"} · {day}
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        count > 0
                          ? "bg-zinc-900 group-hover:bg-black dark:bg-zinc-100 dark:group-hover:bg-white"
                          : "bg-zinc-100 dark:bg-zinc-800/60"
                      }`}
                    />

                    {/* Day label */}
                    <span className="mt-2 text-[10px] text-zinc-400 font-mono">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Referrer & Platform Breakdown Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Referrers */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Traffic Referrers
            </h3>
            <p className="text-[11px] text-zinc-500">
              Origin domains that drove visitors to this short link.
            </p>
          </div>

          {referrers.length === 0 ? (
            <p className="py-8 text-center text-xs text-zinc-400">
              No referrers logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {referrers.slice(0, 7).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                      {item.name}
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      {item.count} clicks ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices & Browsers */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Devices & Browsers
            </h3>
            <p className="text-[11px] text-zinc-500">
              Visitor client hardware and operating environments.
            </p>
          </div>

          {/* Device Type */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Device Type
            </span>
            <div className="grid grid-cols-3 gap-2">
              {["Desktop", "Mobile", "Tablet"].map((dev) => {
                const item = deviceStats.devices.find((d) => d.name === dev);
                const percent = item ? item.percent : 0;
                const Icon =
                  dev === "Desktop"
                    ? Monitor
                    : dev === "Mobile"
                    ? Smartphone
                    : Tablet;

                return (
                  <div
                    key={dev}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 text-center dark:border-zinc-800/80 dark:bg-zinc-800/30"
                  >
                    <Icon className="mx-auto h-4 w-4 text-zinc-500 mb-1" />
                    <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                      {dev}
                    </p>
                    <p className="text-[10px] text-zinc-400">{percent}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Browsers */}
          <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Top Browsers
            </span>
            <div className="space-y-2">
              {deviceStats.browsers.slice(0, 4).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.name}
                    </span>
                    <span className="text-zinc-400 text-[11px]">
                      {item.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-700 dark:bg-zinc-300 transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Raw Click Log Table */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
            Recent Redirection Activity
          </h3>
          <p className="text-[11px] text-zinc-500">
            Chronological audit log of incoming visits.
          </p>
        </div>

        {currentLogs.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-400">
            No clicks recorded yet (or counter was reset). Share your short link to view incoming visits.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">Device / Client</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {currentLogs.slice(0, 25).map((log) => {
                  const ua = parseUserAgent(log.userAgent);
                  return (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-zinc-500">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-xs">
                        {cleanReferrer(log.referrer)}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {ua.browser} on {ua.os} ({ua.device})
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-zinc-400">
                        {log.ip ? `${log.ip.slice(0, 15)}...` : "Anonymized"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <QrModal
          isOpen={showQr}
          onClose={() => setShowQr(false)}
          slug={url.slug}
          targetUrl={url.targetUrl}
        />
      )}

      {/* Reset Clicks Modal */}
      {isResetModalOpen && (
        <ConfirmModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleResetClicks}
          isLoading={isResetting}
          title="Reset clicks counter to 0?"
          description={`This will reset the click counter for "/${url.slug}" to 0 and permanently clear all historical visitor and analytics logs for this link.`}
          confirmText="Reset to 0"
          variant="warning"
          icon={RotateCcw}
        />
      )}
    </div>
  );
}
