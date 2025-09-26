'use client';

import { Header } from './header';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col text-sm">
      <Header />
      {children}
    </div>
  );
}