"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  labels?: string[];
}

export function Sparkline({ data, width = 80, height = 24, color = "#3b82f6", fill = true, labels }: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 1;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * w;
    const y = padding + h - ((v - min) / range) * h;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const totalVal = data.reduce((sum, v) => sum + v, 0);
  const lastVal = data[data.length - 1];
  const prevVal = data[data.length - 2];
  const trend = lastVal > prevVal ? "up" : lastVal < prevVal ? "down" : "flat";
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#f87171" : "#94a3b8";

  return (
    <div className="inline-flex items-center gap-1.5" title={labels ? labels.map((l, i) => `${l}: ${data[i]}`).join(", ") : undefined}>
      <svg width={width} height={height} className="overflow-visible">
        {fill && <path d={fillPath} fill={color} opacity={0.1} />}
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Current value dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} fill={trendColor} />
      </svg>
      <span className="text-[9px] font-mono" style={{ color: trendColor }}>
        {totalVal}
      </span>
    </div>
  );
}
