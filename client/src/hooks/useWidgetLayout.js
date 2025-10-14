import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabaseClient';



// This js file manages the widget layouts for different screen sizes (breakpoints)
// It loads/saves layouts from/to Supabase and provides functions to handle layout changes and resets.

const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'calendar', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 4 },
    { i: 'todo', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'weather', x: 0, y: 4, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'gpt', x: 4, y: 4, w: 8, h: 3, minW: 4, minH: 3 },
  ],
  md: [
    { i: 'calendar', x: 0, y: 0, w: 5, h: 4, minW: 4, minH: 4 },
    { i: 'todo', x: 5, y: 0, w: 5, h: 4, minW: 3, minH: 3 },
    { i: 'weather', x: 0, y: 4, w: 5, h: 3, minW: 3, minH: 2 },
    { i: 'gpt', x: 5, y: 4, w: 5, h: 3, minW: 4, minH: 3 },
  ],
  sm: [
    { i: 'calendar', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 4 },
    { i: 'todo', x: 0, y: 4, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'weather', x: 0, y: 8, w: 6, h: 3, minW: 3, minH: 2 },
    { i: 'gpt', x: 0, y: 11, w: 6, h: 3, minW: 4, minH: 3 },
  ],
  xs: [
    { i: 'calendar', x: 0, y: 0, w: 4, h: 4, minW: 4, minH: 4 },
    { i: 'todo', x: 0, y: 4, w: 4, h: 4, minW: 3, minH: 3 },
    { i: 'weather', x: 0, y: 8, w: 4, h: 3, minW: 3, minH: 2 },
    { i: 'gpt', x: 0, y: 11, w: 4, h: 3, minW: 4, minH: 3 },
  ],
};

export function useWidgetLayout() {
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          await loadLayouts(user.id);
        }
      } catch (error) {
        console.error('Error initializing layout:', error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const loadLayouts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('widget_layouts')
        .select('breakpoint, items')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading layouts:', error);
        return;
      }

      if (data && data.length > 0) {
        const loadedLayouts = { ...DEFAULT_LAYOUTS };
        
        data.forEach((layout) => {
          loadedLayouts[layout.breakpoint] = layout.items;
        });

        setLayouts(loadedLayouts);
      }
    } catch (error) {
      console.error('Error loading layouts:', error);
    }
  };

  const saveLayout = useCallback(async (breakpoint, items) => {
    if (!user) {
      console.warn('Cannot save layout: user not logged in');
      return;
    }

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('widget_layouts')
          .upsert(
            {
              user_id: user.id,
              breakpoint: breakpoint,
              items: items,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,breakpoint',
            }
          );

        if (error) {
          console.error('Error saving layout:', error);
        } else {
          console.log(`Layout saved for breakpoint: ${breakpoint}`);
        }
      } catch (error) {
        console.error('Error saving layout:', error);
      }
    }, 800);

    setSaveTimeout(timeout);
  }, [user, saveTimeout]);

  const handleLayoutChange = useCallback((newLayout, allLayouts) => {
    setLayouts(allLayouts);

    Object.keys(allLayouts).forEach((breakpoint) => {
      saveLayout(breakpoint, allLayouts[breakpoint]);
    });
  }, [saveLayout]);

  const resetLayout = useCallback(async () => {
    setLayouts(DEFAULT_LAYOUTS);

    if (!user) return;

    try {
      const { error } = await supabase
        .from('widget_layouts')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting layout:', error);
      } else {
        console.log('Layout reset to defaults');
      }
    } catch (error) {
      console.error('Error resetting layout:', error);
    }
  }, [user]);

  return {
    layouts,
    loading,
    handleLayoutChange,
    resetLayout,
    isLoggedIn: !!user,
  };
}