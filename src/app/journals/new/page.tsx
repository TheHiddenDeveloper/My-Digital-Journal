import { JournalForm } from '@/components/JournalForm';
import { createJournalAction } from '@/lib/actions';

export default function NewJournalPage() {
  return <JournalForm action={createJournalAction} />;
}
