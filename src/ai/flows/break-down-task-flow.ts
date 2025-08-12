'use server';
/**
 * @fileOverview An AI flow to break down a complex task into smaller sub-tasks.
 *
 * - breakDownTask - A function that takes a task and returns a list of sub-tasks.
 * - BreakDownTaskInput - The input type for the breakDownTask function.
 * - BreakDownTaskOutput - The return type for the breakDownTask function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the task breakdown flow
const BreakDownTaskInputSchema = z.object({
  taskTitle: z.string().describe('The title of the main task to be broken down.'),
  taskDescription: z.string().optional().describe('An optional description of the main task for more context.'),
});
export type BreakDownTaskInput = z.infer<typeof BreakDownTaskInputSchema>;

// Output schema for the task breakdown flow
const BreakDownTaskOutputSchema = z.object({
  subTasks: z.array(z.string()).describe('A list of small, actionable sub-task titles.'),
});
export type BreakDownTaskOutput = z.infer<typeof BreakDownTaskOutputSchema>;


/**
 * Takes a task's title and optional description and uses AI to generate
 * a list of smaller, actionable sub-tasks.
 * @param input The task information.
 * @returns A promise that resolves to an object containing an array of sub-task strings.
 */
export async function breakDownTask(input: BreakDownTaskInput): Promise<BreakDownTaskOutput> {
  return breakDownTaskFlow(input);
}


// AI prompt definition
const breakDownTaskPrompt = ai.definePrompt({
  name: 'breakDownTaskPrompt',
  input: { schema: BreakDownTaskInputSchema },
  output: { schema: BreakDownTaskOutputSchema },
  prompt: `You are an expert project manager. Your goal is to break down a larger task into a list of smaller, actionable sub-tasks.

Based on the provided task title and description, generate a list of 3-5 sub-tasks. Each sub-task should be a clear, concise action item.

Return ONLY the list of sub-task titles.

Main Task Title: {{{taskTitle}}}
{{#if taskDescription}}
Main Task Description: {{{taskDescription}}}
{{/if}}
`,
});

// Genkit flow definition
const breakDownTaskFlow = ai.defineFlow(
  {
    name: 'breakDownTaskFlow',
    inputSchema: BreakDownTaskInputSchema,
    outputSchema: BreakDownTaskOutputSchema,
  },
  async (input) => {
    const { output } = await breakDownTaskPrompt(input);
    return output!;
  }
);
