'use client';

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container mx-auto py-4 px-4 flex justify-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Chess Analyzer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}