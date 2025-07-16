'use client';

import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import BodyWithTheme from './BodyWithTheme';

export default function HtmlThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    // 🧹 Supprime toute classe au départ
    document.documentElement.classList.remove('light-mode');

    // ✅ Applique uniquement si mode clair actif
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  }, [theme]);

  return <BodyWithTheme>{children}</BodyWithTheme>;
}
