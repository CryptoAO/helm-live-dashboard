"use client";

interface TimeAgoProps {
  timestamp: string | null;
  className?: string;
}

function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return "never";
  const now = Date.now();
  let ts: number;

  if (/^\d+$/.test(timestamp)) {
    ts = parseInt(timestamp);
  } else {
    ts = new Date(timestamp).getTime();
  }

  if (isNaN(ts)) return timestamp;

  const diff = now - ts;
  if (diff < 0) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function TimeAgo({ timestamp, className = "" }: TimeAgoProps) {
  return <span className={`text-slate-500 ${className}`}>{formatTimeAgo(timestamp)}</span>;
}
