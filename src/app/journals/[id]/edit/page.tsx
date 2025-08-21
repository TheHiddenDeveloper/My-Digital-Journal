import { JournalForm } from '@/components/JournalForm';
import { updateJournalAction } from '@/lib/actions';
import { getJournal } from '@/lib/api';
import { notFound } from 'next/navigation';

type EditJournalPageProps = {
    params: { id: string };
};

export default async function EditJournalPage({ params }: EditJournalPageProps) {
  const id = params.id;
  
  try {
    const journal = await getJournal(id);
    if (!journal) {
      notFound();
    }
    
    const updateActionWithId = updateJournalAction.bind(null, id);

    return <JournalForm journal={journal} action={updateActionWithId} />;
  } catch (error) {
    notFound();
  }
}
