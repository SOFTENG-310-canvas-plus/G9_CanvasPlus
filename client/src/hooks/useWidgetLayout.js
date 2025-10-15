import { useState, useEffect } from 'react';
import { DEFAULT_LAYOUTS, GRID_CONFIG } from '../config/widgetLayoutDefaults';
import { validateLayout } from '../lib/layoutUtils';
import { getUserPreferences, saveUserPreferences } from '../api/preferences';

export function useWidgetLayout(user, currentBreakpoint = 'lg') {
  const [layout, setLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLayout() {
      setIsLoading(true);

      if (user) {
        try {
          const prefs = await getUserPreferences(user.id);
          if (prefs?.widget_layout) {
            const savedLayout = JSON.parse(prefs.widget_layout);
            const layoutForBreakpoint = savedLayout[currentBreakpoint];
            
            if (layoutForBreakpoint) {
              validateLayout(layoutForBreakpoint, GRID_CONFIG[currentBreakpoint].cols);
              setLayout(layoutForBreakpoint);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Failed to load saved layout:', error);
        }
      }

      // Fallback to default layout
      const defaultLayout = DEFAULT_LAYOUTS[currentBreakpoint] || DEFAULT_LAYOUTS.lg;
      validateLayout(defaultLayout, GRID_CONFIG[currentBreakpoint].cols);
      setLayout(defaultLayout);
      setIsLoading(false);
    }

    loadLayout();
  }, [user, currentBreakpoint]);

  const saveLayout = async (newLayout) => {
    if (!user) return;

    try {
      const prefs = await getUserPreferences(user.id);
      const allLayouts = prefs?.widget_layout ? JSON.parse(prefs.widget_layout) : {};
      allLayouts[currentBreakpoint] = newLayout;

      await saveUserPreferences({
        userId: user.id,
        widgetLayout: JSON.stringify(allLayouts),
      });

      setLayout(newLayout);
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  return { layout, isLoading, saveLayout };
}