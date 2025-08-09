'use server';

/**
 * @fileOverview Provides smart task suggestions based on the time of day and recent habits.
 *
 * - getSmartTaskSuggestions - A function that returns smart task suggestions.
 * - SmartTaskSuggestionsInput - The input type for the getSmartTaskSuggestions function.
 * - SmartTaskSuggestionsOutput - The return type for the getSmartTaskSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskSuggestionsInputSchema = z.object({
  timeOfDay: z.string().describe('The current time of day (e.g., morning, afternoon, evening, night).'),
  recentHabits: z.string().describe('A description of the user\'s recent habits and activities.'),
});
export type SmartTaskSuggestionsInput = z.infer<typeof SmartTaskSuggestionsInputSchema>;

const SmartTaskSuggestionsOutputSchema = z.object({
  suggestedTasks: z.array(z.string()).describe('A list of suggested tasks based on the time of day and recent habits.'),
});
export type SmartTaskSuggestionsOutput = z.infer<typeof SmartTaskSuggestionsOutputSchema>;

export async function getSmartTaskSuggestions(input: SmartTaskSuggestionsInput): Promise<SmartTaskSuggestionsOutput> {
  return smartTaskSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTaskSuggestionsPrompt',
  input: {schema: SmartTaskSuggestionsInputSchema},
  output: {schema: SmartTaskSuggestionsOutputSchema},
  prompt: `You are a personal assistant that suggests tasks to users based on the time of day and their recent habits.

  Time of Day: {{{timeOfDay}}}
  Recent Habits: {{{recentHabits}}}

  Suggest a list of tasks that the user might have forgotten to do, based on the time of day and their recent habits. Be concise.
  Format your response as a JSON array of strings.`,
});

const smartTaskSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartTaskSuggestionsFlow',
    inputSchema: SmartTaskSuggestionsInputSchema,
    outputSchema: SmartTaskSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
