'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="w-full">
      <div className="container mx-auto flex items-center px-4">
        <Link href="/" className="mr-auto flex items-center">
          <Image
            src="/logo.png"
            alt="Chess Analyzer Logo"
            width={140}
            height={40}
            priority
            className="h-26 w-auto object-contain"
          />
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          {/* Add navigation items in the future */}
        </nav>
      </div>
    </header>
  );
}