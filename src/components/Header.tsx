import Link from 'next/link';
import { BookMarked } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b py-4 px-4 md:px-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BookMarked className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            My Digital Journal
          </h1>
        </Link>
      </div>
    </header>
  );
}
