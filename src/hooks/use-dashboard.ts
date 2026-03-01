"use client";
import { useState, useEffect, useCallback } from "react";
import type { DashboardData } from "@/lib/data/types";

interface SnapshotMeta {
  generatedAt: string;
  hostname: string;
  version: string;
}

export function useDashboard(autoRefreshMs: number = 30_000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [dataSource, setDataSource] = useState<"live" | "snapshot" | "">("");
  const [snapshotAge, setSnapshotAge] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);

      // Track data source
      const source = res.headers.get("X-Data-Source") as "live" | "snapshot" || "live";
      setDataSource(source);

      // If snapshot, compute age
      if (source === "snapshot" && json._snapshot) {
        const meta = json._snapshot as SnapshotMeta;
        const snapshotTime = new Date(meta.generatedAt);
        const now = new Date();
        const diffMin = Math.floor((now.getTime() - snapshotTime.getTime()) / 60000);
        if (diffMin < 1) setSnapshotAge("just now");
        else if (diffMin < 60) setSnapshotAge(`${diffMin}m ago`);
        else if (diffMin < 1440) setSnapshotAge(`${Math.floor(diffMin / 60)}h ago`);
        else setSnapshotAge(`${Math.floor(diffMin / 1440)}d ago`);
      }

      setLastRefresh(new Date().toLocaleTimeString("en-PH", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: "Asia/Manila"
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, autoRefreshMs);
    return () => clearInterval(interval);
  }, [fetchData, autoRefreshMs]);

  return { data, loading, error, lastRefresh, refresh, dataSource, snapshotAge };
}
