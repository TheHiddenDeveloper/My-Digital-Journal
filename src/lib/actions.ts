'use server';

import { z } from 'zod';
import { createJournal, deleteJournal, updateJournal } from './api';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { suggestTitle } from '@/ai/flows/suggest-title';

const journalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});

export type FormState = {
  message: string;
  errors?: {
    title?: string[];
    content?: string[];
    tags?: string[];
    isPublished?: string[];
  };
};

function parseTags(tagsString?: string): string[] {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
}

export async function createJournalAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = journalSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        tags: formData.get('tags'),
        isPublished: formData.get('isPublished') === 'on',
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to create journal entry. Please check the errors below.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const tags = parseTags(validatedFields.data.tags);

    try {
        const newJournal = await createJournal({ ...validatedFields.data, tags });
        revalidateTag('journals');
        redirect(`/journals/${newJournal.data.id}`);
    } catch (e) {
        return { message: e instanceof Error ? e.message : 'Failed to create journal entry.' };
    }
}


export async function updateJournalAction(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = journalSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        tags: formData.get('tags'),
        isPublished: formData.get('isPublished') === 'on',
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update journal entry. Please check the errors below.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const tags = parseTags(validatedFields.data.tags);

    try {
        await updateJournal(id, { ...validatedFields.data, tags });
    } catch (e) {
        return { message: e instanceof Error ? e.message : 'Failed to update journal entry.' };
    }

    revalidateTag('journals');
    redirect(`/journals/${id}`);
}


export async function deleteJournalAction(id: string) {
    try {
        await deleteJournal(id);
        revalidateTag('journals');
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to delete journal entry.';
        console.error(message);
        return { message };
    }
    redirect('/');
}

export async function getAiSuggestionsAction(content: string): Promise<{ suggestions: string[] } | { error: string }> {
    if (!content || content.length < 50) {
        return { error: "Please write at least 50 characters to get suggestions." };
    }
    try {
        const result = await suggestTitle({ content });
        return { suggestions: result.titleSuggestions };
    } catch (error) {
        console.error("AI suggestion error:", error);
        return { error: "Could not get AI suggestions at this time." };
    }
}
