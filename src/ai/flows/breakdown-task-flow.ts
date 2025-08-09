'use server';

/**
 * @fileOverview Breaks down a complex task into smaller, manageable sub-tasks.
 *
 * - breakdownTask - A function that breaks down a task into sub-tasks.
 * - BreakdownTaskInput - The input type for the breakdownTask function.
 * - BreakdownTaskOutput - The return type for the breakdownTask function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BreakdownTaskInputSchema = z.object({
  taskTitle: z.string().describe('The title of the complex task to be broken down.'),
  taskDescription: z.string().optional().describe('An optional description of the task for more context.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const BreakdownTaskOutputSchema = z.object({
  subTasks: z.array(z.object({
    title: z.string().describe('The title of the sub-task.'),
    description: z.string().optional().describe('A brief description for the sub-task.'),
  })).describe('A list of suggested sub-tasks.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: { schema: BreakdownTaskInputSchema },
  output: { schema: BreakdownTaskOutputSchema },
  prompt: `You are an expert project manager. A user wants to break down a complex task into smaller, actionable sub-tasks.

  Task Title: {{{taskTitle}}}
  {{#if taskDescription}}Task Description: {{{taskDescription}}}{{/if}}

  Analyze the task and generate a list of 2-5 clear, concise, and actionable sub-tasks. Each sub-task should have a title and an optional brief description.
  Format your response as a JSON object with a "subTasks" array.`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
