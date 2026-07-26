import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('glowfit-theme') as Theme) || 'system';
  });

  const [resolved, setResolved] = useState<'light' | 'dark'>(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') setResolved(getSystemTheme());
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const next = theme === 'system' ? getSystemTheme() : theme;
    setResolved(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem('glowfit-theme', t);
    setThemeState(t);
  };

  return { theme, resolved, setTheme };
}
