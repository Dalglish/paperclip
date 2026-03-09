/** ISA-101 chart theme for Recharts — Bloomberg terminal aesthetic */

export const CHART_COLORS = [
  '#6B9BD2', // steel blue (primary)
  '#72B07F', // muted green
  '#C8B86B', // gold
  '#C87070', // muted red
  '#A8C4A2', // sage
  '#7FB3D3', // light blue
  '#93C6D4', // teal
] as const;

export const AXIS_STYLE = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  fontFamily: 'inherit',
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_STYLE = {
  stroke: 'hsl(var(--border))',
  strokeDasharray: '3 3',
} as const;

export const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 6,
  fontSize: 12,
  color: 'hsl(var(--card-foreground))',
} as const;

export const TOOLTIP_LABEL_STYLE = {
  color: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
} as const;
