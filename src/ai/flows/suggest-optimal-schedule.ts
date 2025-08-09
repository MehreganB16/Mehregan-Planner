'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal scheduling options using AI.
 *
 * The flow takes in a list of tasks and constraints and returns a suggested schedule.
 *
 * @module ai/flows/suggest-optimal-schedule
 *
 * @interface SuggestOptimalScheduleInput - The input type for the suggestOptimalSchedule function.
 * @interface SuggestOptimalScheduleOutput - The output type for the suggestOptimalSchedule function.
 * @function suggestOptimalSchedule - The main function to trigger the optimal schedule suggestion flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalScheduleInputSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string().describe('The name of the task.'),
      duration: z.number().describe('The duration of the task in minutes.'),
      priority: z.enum(['high', 'medium', 'low']).describe('The priority of the task.'),
    })
  ).describe('A list of tasks to schedule.'),
  constraints: z.array(
    z.object({
      dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).describe('The day of the week.'),
      startTime: z.string().describe('The start time in HH:MM format.'),
      endTime: z.string().describe('The end time in HH:MM format.'),
      description: z.string().optional().describe('Details about the constraint, such as a meeting or appointment.'),
    })
  ).describe('A list of constraints that must be considered when scheduling.'),
});
export type SuggestOptimalScheduleInput = z.infer<typeof SuggestOptimalScheduleInputSchema>;

const SuggestOptimalScheduleOutputSchema = z.object({
  schedule: z.array(
    z.object({
      taskName: z.string().describe('The name of the scheduled task.'),
      dayOfWeek: z.string().describe('The day of the week the task is scheduled for.'),
      startTime: z.string().describe('The start time of the task in HH:MM format.'),
      endTime: z.string().describe('The end time of the task in HH:MM format.'),
    })
  ).describe('The suggested schedule.'),
  reasoning: z.string().describe('The AI reasoning for the suggested schedule.'),
});
export type SuggestOptimalScheduleOutput = z.infer<typeof SuggestOptimalScheduleOutputSchema>;

export async function suggestOptimalSchedule(input: SuggestOptimalScheduleInput): Promise<SuggestOptimalScheduleOutput> {
  return suggestOptimalScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalSchedulePrompt',
  input: {schema: SuggestOptimalScheduleInputSchema},
  output: {schema: SuggestOptimalScheduleOutputSchema},
  prompt: `You are an AI scheduling assistant. Your task is to generate an optimal schedule, reasoning, given a list of tasks and constraints.

Tasks:
{{#each tasks}}
- Name: {{this.name}}, Duration: {{this.duration}} minutes, Priority: {{this.priority}}
{{/each}}

Constraints:
{{#each constraints}}
- Day: {{this.dayOfWeek}}, Time: {{this.startTime}} - {{this.endTime}}, Description: {{this.description}}
{{/each}}

Based on the provided tasks and constraints, create an optimal schedule. Provide clear reasoning for your scheduling decisions.

Ensure that the output schedule adheres to all provided constraints and takes into account the priority and duration of each task.
`,
});

const suggestOptimalScheduleFlow = ai.defineFlow(
  {
    name: 'suggestOptimalScheduleFlow',
    inputSchema: SuggestOptimalScheduleInputSchema,
    outputSchema: SuggestOptimalScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
