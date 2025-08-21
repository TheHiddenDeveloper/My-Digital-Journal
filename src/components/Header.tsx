import Link from 'next/link';
import { BookMarked } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b py-4 px-4 md:px-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <BookMarked className="h-6 w-6 group-hover:animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold font-headline text-foreground">
            My Digital Journal
          </h1>
        </Link>
      </div>
    </header>
  );
}
