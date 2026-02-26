"use client";
import { Shell } from "@/components/layout/shell";

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
