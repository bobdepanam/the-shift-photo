'use client';

import '@/styles/main.scss';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import LenisWrapper from '@/components/Lenis/LenisWrapper';
import IntroLayoutWrapper from '@/components/LayoutWrapper/IntroLayoutWrapper';

export default function BodyWithTheme({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <IntroLayoutWrapper>
        <Header />
        <LenisWrapper />
        <div id="pageContent" className="page-visible">
          {children}
        </div>
        <Footer />
      </IntroLayoutWrapper>
    </body>
  );
}
