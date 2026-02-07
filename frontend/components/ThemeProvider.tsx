'use client';

import { useThemeStore } from '@/store/theme';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setMounted(true);
    // Aplicar tema inicial desde localStorage
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  return <>{children}</>;
}
