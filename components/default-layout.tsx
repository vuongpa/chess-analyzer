'use client';

import { Header } from './header';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* Container with fixed width in the middle, leaving space for future ads on sides */}
        <div className="container mx-auto px-4 flex flex-col flex-1 py-6">
          {children}
        </div>
      </div>
      
      {/* <Footer /> */}
      
      {/* These divs represent the spaces where ads could be placed in the future */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[calc((100%-1152px)/2)] bg-transparent"></div>
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-[calc((100%-1152px)/2)] bg-transparent"></div>
    </div>
  );
}