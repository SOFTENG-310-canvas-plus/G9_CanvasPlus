export interface WidgetMetadata {
  id: string;
  title: string;
  minW?: number;
  minH?: number;
  defaultW: number;
  defaultH: number;
}

export const WIDGETS: Record<string, WidgetMetadata> = {
  weather: {
    id: 'weather',
    title: 'Weather',
    minW: 2,
    minH: 2,
    defaultW: 2,
    defaultH: 2,
  },
  clock: {
    id: 'clock',
    title: 'Clock',
    minW: 3,
    minH: 2,
    defaultW: 5,
    defaultH: 2,
  },
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    minW: 3,
    minH: 3,
    defaultW: 4,
    defaultH: 3,
  },
  todo: {
    id: 'todo',
    title: 'TODO List',
    minW: 3,
    minH: 3,
    defaultW: 3,
    defaultH: 4,
  },
  schedule: {
    id: 'schedule',
    title: 'Daily Schedule',
    minW: 4,
    minH: 4,
    defaultW: 4,
    defaultH: 4.2,
  },
  notes: {
    id: 'notes',
    title: 'Notes',
    minW: 3,
    minH: 3,
    defaultW: 3,
    defaultH: 3,
  },
  gptWrapper: {
    id: 'gptWrapper',
    title: 'ChatGPT Wrapper',
    minW: 4,
    minH: 3,
    defaultW: 6,
    defaultH: 3,
  },
  search: {
    id: 'search',
    title: 'Search',
    minW: 3,
    minH: 1,
    defaultW: 4,
    defaultH: 1,
  },
  canvas: {
    id: 'canvas',
    title: 'Canvas Tasks',
    minW: 3,
    minH: 3,
    defaultW: 3,
    defaultH: 4,
  },
};