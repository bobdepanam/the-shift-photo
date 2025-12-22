// src/app/layout.tsx

import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import HtmlThemeWrapper from '@/components/Theme/HtmlThemeWrapper';

export const metadata: Metadata = {
  title: {
    default: "MacShift — Visual Research, Photography & Hybrid Imagery",
    template: "%s — MacShift",
  },
  description:
    "The Shift is a personal visual research project by MacShift, a creative director exploring photography, digital imagery, and hybrid forms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <HtmlThemeWrapper>{children}</HtmlThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
