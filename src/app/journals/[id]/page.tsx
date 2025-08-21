import { getJournal } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { DeleteJournalButton } from '@/components/DeleteJournalButton';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';

type JournalPageProps = {
    params: { id: string };
};

export default async function JournalPage({ params }: JournalPageProps) {
    const id = params.id;
    
    try {
        const { data: journal } = await getJournal(id);

        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4 -ml-4">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to all entries
                        </Link>
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <h1 className="text-4xl font-bold font-headline mb-2">{journal.Title}</h1>
                            <p className="text-sm text-muted-foreground">
                                Last updated on {format(new Date(journal.UpdatedAt), 'MMMM d, yyyy, p')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                {journal.Tags.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                                {journal.IsPublished ? (
                                    <Badge variant="default">Published</Badge>
                                ) : (
                                    <Badge variant="outline">Draft</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button asChild size="sm">
                                <Link href={`/journals/${journal.Id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                            <DeleteJournalButton journalId={journal.Id} />
                        </div>
                    </div>
                </div>

                <Card>
                    <article className="p-6 sm:p-8 space-y-4">
                        <div className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: journal.Content.replace(/\n/g, '<br />') }} />
                    </article>
                </Card>
            </div>
        );
    } catch (error) {
        notFound();
    }
}
