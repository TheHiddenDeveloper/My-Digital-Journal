import { JournalList } from '@/components/JournalList';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { getJournals } from '@/lib/api';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type HomePageProps = {
  searchParams?: {
    page?: string;
    search?: string;
    tag?: string;
  };
};

function JournalListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3 p-4 border bg-card rounded-lg">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                     <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            ))}
        </div>
    )
}

async function Journals({ searchParams }: HomePageProps) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || '';
  const tag = searchParams?.tag || '';
  const pageSize = 9;

  try {
    const { data, totalPages, currentPage } = await getJournals({ page, pageSize, search, tag });
    return (
      <>
        <JournalList journals={data} />
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </>
    );
  } catch (error) {
    const isFetchError = error instanceof TypeError && error.message.includes('fetch failed');
    const errorMessage = isFetchError
      ? 'Could not connect to the backend API. Please make sure the API server is running.'
      : error instanceof Error
        ? error.message
        : 'An unknown error occurred.';

    return (
      <div className="text-center py-16 text-destructive bg-destructive/10 rounded-lg">
          <h2 className="text-2xl font-semibold">Failed to load journal entries.</h2>
          <p className="mt-2">{errorMessage}</p>
          {isFetchError && (
            <p className="text-sm text-muted-foreground mt-4">Is the backend API server running at http://localhost:5000?</p>
          )}
      </div>
    );
  }
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">My Entries</h1>
        <Button asChild>
          <Link href="/journals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>
      
      <Suspense fallback={<JournalListSkeleton />}>
        <Journals searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
