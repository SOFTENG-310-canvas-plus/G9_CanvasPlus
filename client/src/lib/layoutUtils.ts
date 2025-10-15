import { LayoutItem } from '../config/widgetLayoutDefaults';

interface ValidationError {
  type: 'duplicate' | 'overlap' | 'out-of-bounds';
  message: string;
  items?: string[];
}

export function validateLayout(
  layout: LayoutItem[],
  cols: number
): ValidationError[] {
  if (process.env.NODE_ENV !== 'development') return [];

  const errors: ValidationError[] = [];
  const seen = new Set<string>();

  // Check for duplicate IDs
  for (const item of layout) {
    if (seen.has(item.i)) {
      errors.push({
        type: 'duplicate',
        message: `Duplicate widget ID: ${item.i}`,
        items: [item.i],
      });
    }
    seen.add(item.i);
  }

  // Check for out-of-bounds
  for (const item of layout) {
    if (item.col < 0 || item.col + item.w > cols) {
      errors.push({
        type: 'out-of-bounds',
        message: `Widget ${item.i} is out of bounds (col: ${item.col}, w: ${item.w}, cols: ${cols})`,
        items: [item.i],
      });
    }
  }

  // Check for overlaps
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const a = layout[i];
      const b = layout[j];

      const overlapX = a.col < b.col + b.w && b.col < a.col + a.w;
      const overlapY = a.row < b.row + b.h && b.row < a.row + a.h;

      if (overlapX && overlapY) {
        errors.push({
          type: 'overlap',
          message: `Widgets overlap: ${a.i} and ${b.i}`,
          items: [a.i, b.i],
        });
      }
    }
  }

  if (errors.length > 0) {
    console.warn('[Layout Validation]', errors);
  }

  return errors;
}