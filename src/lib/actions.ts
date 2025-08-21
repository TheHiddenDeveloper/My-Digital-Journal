'use server';

import { z } from 'zod';
import { createJournal, deleteJournal, updateJournal } from './api';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { suggestTitle } from '@/ai/flows/suggest-title';
import { Journal } from './types';

const journalSchema = z.object({
  Title: z.string().min(3, 'Title must be at least 3 characters long.'),
  Content: z.string().min(10, 'Content must be at least 10 characters long.'),
  Tags: z.string().optional(),
  IsPublished: z.boolean(),
});

export type FormState = {
  message: string;
  errors?: {
    Title?: string[];
    Content?: string[];
    Tags?: string[];
    IsPublished?: string[];
  };
};

function parseTags(tagsString?: string): string[] {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
}

export async function createJournalAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = journalSchema.safeParse({
        Title: formData.get('title'),
        Content: formData.get('content'),
        Tags: formData.get('tags'),
        IsPublished: formData.get('isPublished') === 'on',
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to create journal entry. Please check the errors below.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const tags = parseTags(validatedFields.data.Tags);

    let newJournal: Journal | null = null;
    try {
        newJournal = await createJournal({ ...validatedFields.data, Tags: tags });
        if (!newJournal || !newJournal.Id) {
            return { message: 'Failed to create journal entry: Invalid response from API.' };
        }
    } catch (e) {
        return { message: e instanceof Error ? e.message : 'Failed to create journal entry.' };
    }
    
    revalidateTag('journals');
    redirect(`/journals/${newJournal.Id}`);
}


export async function updateJournalAction(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = journalSchema.safeParse({
        Title: formData.get('title'),
        Content: formData.get('content'),
        Tags: formData.get('tags'),
        IsPublished: formData.get('isPublished') === 'on',
    });

    if (!validatedFields.success) {
        return {
            message: 'Failed to update journal entry. Please check the errors below.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const tags = parseTags(validatedFields.data.Tags);

    try {
        await updateJournal(id, { ...validatedFields.data, Tags: tags });
    } catch (e) {
        return { message: e instanceof Error ? e.message : 'Failed to update journal entry.' };
    }

    revalidateTag('journals');
    revalidateTag(`journals:${id}`);
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
