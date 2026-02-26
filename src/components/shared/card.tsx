"use client";
import React from "react";

interface CardProps {
  title?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  span?: number;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ title, badge, actions, className = "", span, children, onClick }: CardProps) {
  const spanClass = span === 2 ? "md:col-span-2" : span === 3 ? "md:col-span-3" : "";
  return (
    <div
      className={`rounded-xl border border-card-border bg-card-bg p-4 ${spanClass} ${onClick ? "cursor-pointer hover:border-slate-600 transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      {(title || badge || actions) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">{title}</h3>}
            {badge}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
