// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered title suggestion for journal entries.
 *
 * This file exports:
 * - `suggestTitle`:  Async function to generate title suggestions based on journal entry content.
 * - `SuggestTitleInput`: The input type for the suggestTitle function.
 * - `SuggestTitleOutput`: The return type for the suggestTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for the input
const SuggestTitleInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the journal entry to generate a title for.'),
});

export type SuggestTitleInput = z.infer<typeof SuggestTitleInputSchema>;

// Define the schema for the output
const SuggestTitleOutputSchema = z.object({
  titleSuggestions: z
    .array(z.string())
    .describe('An array of suggested titles for the journal entry.'),
});

export type SuggestTitleOutput = z.infer<typeof SuggestTitleOutputSchema>;

// Exported function to suggest a title for a journal entry
export async function suggestTitle(input: SuggestTitleInput): Promise<SuggestTitleOutput> {
  return suggestTitleFlow(input);
}

// Define the prompt for title suggestion
const suggestTitlePrompt = ai.definePrompt({
  name: 'suggestTitlePrompt',
  input: {schema: SuggestTitleInputSchema},
  output: {schema: SuggestTitleOutputSchema},
  prompt: `You are an AI assistant designed to suggest titles for journal entries. 
Given the content of a journal entry, generate three different title suggestions that are concise and relevant to the content. Return the suggestions as a JSON array.

Journal Entry Content: {{{content}}}`,
});

// Define the flow for suggesting titles
const suggestTitleFlow = ai.defineFlow(
  {
    name: 'suggestTitleFlow',
    inputSchema: SuggestTitleInputSchema,
    outputSchema: SuggestTitleOutputSchema,
  },
  async input => {
    const {output} = await suggestTitlePrompt(input);
    return output!;
  }
);
