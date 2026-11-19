"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CopyButton from "../../CopyButton";
import QrModal from "../../QrModal";

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

    logs.forEach((log) => {
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
  }, [logs]);

  // Referrer breakdown
  const referrers = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      const ref = cleanReferrer(log.referrer);
      counts[ref] = (counts[ref] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / (logs.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Device & Platform breakdown
  const deviceStats = useMemo(() => {
    const devices = {};
    const browsers = {};
    const osList = {};

    logs.forEach((log) => {
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
          percent: Math.round((count / (logs.length || 1)) * 100),
        }))
        .sort((a, b) => b.count - a.count);

    return {
      devices: format(devices),
      browsers: format(browsers),
      os: format(osList),
    };
  }, [logs]);

  return (
    <div className="space-y-8">
      {/* URL Header Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-tight text-black dark:text-white">
                /{url.slug}
              </span>
              <a
                href={`/r/${url.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:text-black dark:border-zinc-800 dark:hover:text-white transition-colors"
                title="Open short link"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <CopyButton slug={url.slug} />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Points to:</span>
              <a
                href={url.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-xs sm:max-w-md md:max-w-lg truncate font-mono text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white underline underline-offset-2"
              >
                {url.targetUrl}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg
                width="15"
                height="15"
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
              View QR Code
            </button>
            <Link
              href={`/dashboard/urls/${url.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Edit Link
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Total Clicks
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-black dark:text-white">
            {url.clicks.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            Recorded since creation
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Top Referrer
          </p>
          <p className="mt-2 text-2xl font-bold truncate text-black dark:text-white">
            {referrers[0]?.name || "None yet"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {referrers[0] ? `${referrers[0].count} clicks (${referrers[0].percent}%)` : "No traffic yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Top Device
          </p>
          <p className="mt-2 text-2xl font-bold text-black dark:text-white">
            {deviceStats.devices[0]?.name || "N/A"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {deviceStats.devices[0] ? `${deviceStats.devices[0].percent}% of all traffic` : "No traffic yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Created
          </p>
          <p className="mt-2 text-xl font-bold text-black dark:text-white">
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

      {/* Clicks Timeline Chart */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Click Activity (Last 14 Days)
            </h3>
            <p className="text-xs text-zinc-500">
              Daily traffic distribution for /{url.slug}
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-500">
            {logs.length} logged events
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-8">
          <div className="flex items-end justify-between gap-2 h-44 pt-6">
            {timelineData.entries.map(([day, count]) => {
              const heightPercent = Math.max(
                Math.round((count / timelineData.maxCount) * 100),
                count > 0 ? 8 : 2
              );

              const formattedDate = new Date(day + "T00:00:00").toLocaleDateString(
                undefined,
                { month: "numeric", day: "numeric" }
              );

              return (
                <div
                  key={day}
                  className="group relative flex flex-1 flex-col items-center h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-8 hidden rounded-md bg-black px-2 py-1 text-[10px] font-medium text-white shadow-md group-hover:block dark:bg-white dark:text-black z-10 whitespace-nowrap">
                    {count} click{count !== 1 ? "s" : ""} · {day}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all ${
                      count > 0
                        ? "bg-black dark:bg-white hover:opacity-80"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  />
                  <span className="mt-2 text-[10px] text-zinc-400 font-mono">
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breakdowns 2-Column Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Referrer Sources */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-base font-semibold text-black dark:text-white">
            Top Referrers
          </h3>
          <p className="text-xs text-zinc-500 mb-5">
            Websites and platforms sending visitors
          </p>

          {referrers.length === 0 ? (
            <p className="text-xs text-zinc-400 italic py-6 text-center">
              No referral data recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {referrers.slice(0, 6).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-black dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-zinc-500">
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className="h-full rounded-full bg-black dark:bg-white transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices & Browsers */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Device Breakdown
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Hardware type of visitors
            </p>

            {deviceStats.devices.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-2">
                No device data yet.
              </p>
            ) : (
              <div className="space-y-3">
                {deviceStats.devices.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-black dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-zinc-500">
                        {item.count} ({item.percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        style={{ width: `${item.percent}%` }}
                        className="h-full rounded-full bg-black dark:bg-white transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Top Browsers
            </h4>
            <div className="flex flex-wrap gap-2">
              {deviceStats.browsers.map((b) => (
                <span
                  key={b.name}
                  className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-medium"
                >
                  {b.name} ({b.percent}%)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Raw Click Log */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-black dark:text-white">
              Recent Click Stream
            </h3>
            <p className="text-xs text-zinc-500">
              Latest individual redirects logged
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No clicks recorded for this URL yet. Visit or share the link to start logging!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 border-b border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Referrer</th>
                  <th className="px-6 py-3">Browser / OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {logs.slice(0, 15).map((log) => {
                  const uaInfo = parseUserAgent(log.userAgent);
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-3.5 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-black dark:text-white">
                        {cleanReferrer(log.referrer)}
                      </td>
                      <td className="px-6 py-3.5 text-zinc-500">
                        {uaInfo.browser} · {uaInfo.os} ({uaInfo.device})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQr && (
        <QrModal
          isOpen={showQr}
          onClose={() => setShowQr(false)}
          slug={url.slug}
          targetUrl={url.targetUrl}
        />
      )}
    </div>
  );
}
