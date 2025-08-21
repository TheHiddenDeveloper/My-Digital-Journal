'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

type SearchFormProps = {
    initialSearch?: string;
    initialTag?: string;
}

export function SearchForm({ initialSearch = '', initialTag = '' }: SearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((formData: FormData) => {
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
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <form onChange={(e) => handleSearch(new FormData(e.currentTarget))} className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          name="search" 
          placeholder="Search entries by title or content..." 
          defaultValue={initialSearch}
          className="pl-10"
        />
      </div>
      <Input 
        name="tag" 
        placeholder="Filter by tag..." 
        defaultValue={initialTag}
        className="sm:w-48"
      />
    </form>
  );
}
