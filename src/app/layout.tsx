// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import HtmlThemeWrapper from '@/components/Theme/HtmlThemeWrapper';

export const metadata: Metadata = {
  title: 'THE SHIFT',
  description: 'Portfolio créatif photographie & design',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <ThemeProvider>
        <HtmlThemeWrapper>{children}</HtmlThemeWrapper>
      </ThemeProvider>
    </html>
  );
}
