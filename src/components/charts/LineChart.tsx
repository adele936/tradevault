import { useMemo } from 'react';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillGradient?: boolean;
  showGrid?: boolean;
  showAxis?: boolean;
  className?: string;
}

export function LineChart({
  data,
  width = 600,
  height = 200,
  color = '#3b82f6',
  fillGradient = true,
  showGrid = true,
  className = '',
}: LineChartProps) {
  const { path, areaPath, gridLines, points } = useMemo(() => {
    if (data.length === 0) return { path: '', areaPath: '', gridLines: [], points: [] };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pts = data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y, value };
    });

    const p = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`).join(' ');
    const ap = `${p} L ${pts[pts.length - 1].x.toFixed(2)} ${height - padding} L ${pts[0].x.toFixed(2)} ${height - padding} Z`;

    const grids = [];
    if (showGrid) {
      for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * chartHeight;
        grids.push({ y, value: max - (i / 4) * range });
      }
    }

    return { path: p, areaPath: ap, gridLines: grids, points: pts };
  }, [data, width, height, showGrid]);

  const gradientId = useMemo(() => `grad-${Math.random().toString(36).slice(2)}`, []);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid &&
        gridLines.map((g, i) => (
          <line
            key={i}
            x1="10"
            y1={g.y}
            x2={width - 10}
            y2={g.y}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.1"
          />
        ))}
      {fillGradient && <path d={areaPath} fill={`url(#${gradientId})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.length > 0 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
      )}
    </svg>
  );
}
