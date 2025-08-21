'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Journal } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';

type JournalListProps = {
  journals: Journal[];
};

export function JournalList({ journals }: JournalListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    const tagTerm = formData.get('tag') as string;

    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (tagTerm) {
        params.set('tag', tagTerm);
    } else {
        params.delete('tag');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            name="search" 
            placeholder="Search entries by title or content..." 
            defaultValue={searchParams.get('search') || ''}
            className="pl-10"
          />
        </div>
        <Input 
          name="tag" 
          placeholder="Filter by tag..." 
          defaultValue={searchParams.get('tag') || ''}
          className="sm:w-48"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>
      
      {journals.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg">
          <h2 className="text-2xl font-semibold font-headline">No journal entries found.</h2>
          <p className="text-muted-foreground mt-2">Why not create your first one?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <Card key={journal.Id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card/50">
              <CardHeader>
                <CardTitle className="font-headline line-clamp-2 text-xl">
                  <Link href={`/journals/${journal.Id}`} className="hover:text-primary transition-colors">
                    {journal.Title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {format(parseISO(journal.CreatedAt), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-4 text-sm text-foreground/80">
                  {journal.Content}
                </p>
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                {journal.Tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
