// src/app/layout.tsx

import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import HtmlThemeWrapper from '@/components/Theme/HtmlThemeWrapper';
import BackToTop from '@/components/BackToTop/BackToTop';
import ScrollRevealInit from '@/components/ScrollReveal/ScrollRevealInit';
import PixelTransition from '@/components/Transition/PixelTransition';
import CustomCursor from '@/components/Cursor/CustomCursor';

export const metadata: Metadata = {
  title: {
    default: "MacShift — Visual Research, Photography & Hybrid Imagery",
    template: "%s — MacShift",
  },
  description:
    "The Shift is a personal visual research project by MacShift, a creative director exploring photography, digital imagery, and hybrid forms.",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <HtmlThemeWrapper>
            {children}
            <PixelTransition />
            <CustomCursor />
            <BackToTop />
            <ScrollRevealInit />
          </HtmlThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
