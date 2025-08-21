import { JournalList } from '@/components/JournalList';
import { Pagination } from '@/components/Pagination';
import { getJournals } from '@/lib/api';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchForm } from '@/components/SearchForm';
import { Card } from '@/components/ui/card';

type HomePageProps = {
  searchParams: {
    page?: string;
    search?: string;
    tag?: string;
  };
};

function JournalListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    const { data, totalPages } = await getJournals({ page, pageSize, search, tag });
    
    if (!data || !Array.isArray(data)) {
        return (
          <Card className="text-center py-16 text-destructive bg-destructive/10">
              <h2 className="text-2xl font-semibold">Could not load journal entries.</h2>
              <p className="mt-2">The data received from the server was not in the expected format.</p>
          </Card>
        );
    }
    
    if (data.length === 0) {
      return (
        <Card className="text-center py-16 bg-card/50">
          <h2 className="text-2xl font-semibold font-headline">No journal entries found.</h2>
          <p className="text-muted-foreground mt-2">Why not create your first one?</p>
        </Card>
      );
    }

    return (
      <>
        <JournalList journals={data} />
        <Pagination totalPages={totalPages} />
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
      <Card className="text-center py-16 text-destructive bg-destructive/10">
          <h2 className="text-2xl font-semibold">Failed to load journal entries.</h2>
          <p className="mt-2">{errorMessage}</p>
          {isFetchError && (
            <p className="text-sm text-muted-foreground mt-4">Is the backend API server running at http://localhost:5000?</p>
          )}
      </Card>
    );
  }
}

export default function Home({ searchParams }: HomePageProps) {
  const { page = '1', search = '', tag = '' } = searchParams;
  
  return (
    <div className="space-y-8">
      <SearchForm initialSearch={search} initialTag={tag} />
      
      <Suspense key={`${page}-${search}-${tag}`} fallback={<JournalListSkeleton />}>
        <Journals searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
