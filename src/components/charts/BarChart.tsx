import { useMemo } from 'react';

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({ data, height = 200, color = '#3b82f6', formatValue }: BarChartProps) {
  const max = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="text-xs font-medium text-slate-400">
            {formatValue ? formatValue(d.value) : d.value.toFixed(0)}
          </div>
          <div
            className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
            style={{
              height: `${(d.value / max) * (height - 40)}px`,
              backgroundColor: color,
              minHeight: '4px',
            }}
          />
          <div className="text-xs text-slate-500 truncate w-full text-center">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
