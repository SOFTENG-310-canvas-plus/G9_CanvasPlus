import { WIDGETS } from './widgets';

export interface LayoutItem {
  i: string;
  col: number;
  row: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface BreakpointLayouts {
  lg: LayoutItem[];
  md?: LayoutItem[];
  sm?: LayoutItem[];
  xs?: LayoutItem[];
}

export const DEFAULT_LAYOUTS: BreakpointLayouts = {
  lg: [
    // Row 0
    { i: 'search',     col: 0,  row: 0, w: 4, h: 1 },
    { i: 'calendar',   col: 5,  row: 0, w: 4, h: 3 },

    // Left column block under search
    { i: 'notes',      col: 0,  row: 1, w: 3, h: 3 },
    { i: 'weather',    col: 3,  row: 1, w: 2, h: 2 },

    // Right top stack (two tiles side-by-side, 0..4 rows tall)
    { i: 'todo',       col: 9,  row: 0, w: 4, h: 4 },
    { i: 'schedule',   col: 13, row: 4, w: 4, h: 4 },

    // Middle content
    { i: 'gptWrapper', col: 3,  row: 3, w: 6, h: 3 },

    // Bottom-right block (touches but does not overlap schedule/todo)
    { i: 'canvas',     col: 9,  row: 4, w: 4, h: 4 },

    // Bottom-left wide clock
    { i: 'clock',      col: 0,  row: 6, w: 5, h: 2 },
  ],
  // (add md/sm/xs later as needed)
};

export const GRID_CONFIG = {
  lg: { cols: 17, rowHeight: 96 },
  md: { cols: 12, rowHeight: 90 },
  sm: { cols: 8,  rowHeight: 80 },
  xs: { cols: 4,  rowHeight: 70 },
};