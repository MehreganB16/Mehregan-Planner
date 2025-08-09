'use server';

/**
 * @fileOverview An AI agent that suggests related tasks or needed resources based on the plan being created.
 *
 * - suggestRelatedTasks - A function that handles the suggestion of related tasks.
 * - SuggestRelatedTasksInput - The input type for the suggestRelatedTasks function.
 * - SuggestRelatedTasksOutput - The return type for the suggestRelatedTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedTasksInputSchema = z.object({
  planDescription: z
    .string()
    .describe('The description of the plan for which to suggest related tasks or resources.'),
});
export type SuggestRelatedTasksInput = z.infer<typeof SuggestRelatedTasksInputSchema>;

const SuggestRelatedTasksOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of related tasks or needed resources.'),
});
export type SuggestRelatedTasksOutput = z.infer<typeof SuggestRelatedTasksOutputSchema>;

export async function suggestRelatedTasks(input: SuggestRelatedTasksInput): Promise<SuggestRelatedTasksOutput> {
  return suggestRelatedTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedTasksPrompt',
  input: {schema: SuggestRelatedTasksInputSchema},
  output: {schema: SuggestRelatedTasksOutputSchema},
  prompt: `You are a helpful AI assistant that suggests related tasks or needed resources based on the plan provided by the user.

  Plan Description: {{{planDescription}}}

  Please provide a list of related tasks or needed resources that the user might have missed.
  Format your response as a list of strings.
  `,
});

const suggestRelatedTasksFlow = ai.defineFlow(
  {
    name: 'suggestRelatedTasksFlow',
    inputSchema: SuggestRelatedTasksInputSchema,
    outputSchema: SuggestRelatedTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
