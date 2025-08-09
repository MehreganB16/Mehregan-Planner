'use server';

/**
 * @fileOverview Analyzes a user's task completion habits to provide focus and productivity insights.
 *
 * - analyzeFocus - A function that analyzes tasks and returns productivity insights.
 * - AnalyzeFocusInput - The input type for the analyzeFocus function.
 * - AnalyzeFocusOutput - The return type for the analyzeFocus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Task } from '@/lib/types';

// We can't import the Task type directly into the schema easily, so we redefine for Zod.
const TaskSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.string().optional().describe("ISO 8601 date string"),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    completed: z.boolean(),
    parentId: z.string().optional(),
    completionDate: z.string().optional().describe("ISO 8601 date string"),
    createdAt: z.string().describe("ISO 8601 date string"),
});

const AnalyzeFocusInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('The user\'s list of tasks.'),
  localTime: z.string().describe('The current local time of the user to provide timely advice.'),
});
export type AnalyzeFocusInput = z.infer<typeof AnalyzeFocusInputSchema>;

const AnalyzeFocusOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the user\'s productivity patterns, written in a friendly and encouraging tone.'),
  keyTakeaways: z.array(z.string()).describe('A short list of the most important, actionable takeaways for the user.'),
});
export type AnalyzeFocusOutput = z.infer<typeof AnalyzeFocusOutputSchema>;


// We need to transform the Date objects to strings for the AI flow.
export async function analyzeFocus(tasks: Task[]): Promise<AnalyzeFocusOutput> {
    const input = {
        tasks: tasks.map(task => ({
            ...task,
            dueDate: task.dueDate?.toISOString(),
            completionDate: task.completionDate?.toISOString(),
            createdAt: task.createdAt.toISOString(),
        })),
        localTime: new Date().toLocaleTimeString(),
    };
    return analyzeFocusFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeFocusPrompt',
  input: { schema: AnalyzeFocusInputSchema },
  output: { schema: AnalyzeFocusOutputSchema },
  prompt: `You are a friendly and insightful productivity coach. Your goal is to analyze a user's task list to identify patterns in their work habits and provide actionable advice to help them improve their focus and productivity. The current user's local time is {{{localTime}}}.

  Here is the user's task list in JSON format:
  {{{json tasks}}}

  Analyze the data with these questions in mind:
  - When do they complete most of their tasks (morning, afternoon, evening)? Look at the 'completionDate'.
  - Are they good at completing tasks before the 'dueDate'?
  - Do they prioritize 'urgent' and 'high' priority tasks, or do they tend to finish 'low' priority tasks first?
  - How many tasks have they completed versus how many are still active?
  
  Based on your analysis, provide a helpful and encouraging summary. Address the user directly. Start with a summary of their habits ("Here's what I've noticed..."). Then, provide a bulleted list of key takeaways with concrete suggestions for improvement. Keep the tone positive and motivational.`,
});

const analyzeFocusFlow = ai.defineFlow(
  {
    name: 'analyzeFocusFlow',
    inputSchema: AnalyzeFocusInputSchema,
    outputSchema: AnalyzeFocusOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
