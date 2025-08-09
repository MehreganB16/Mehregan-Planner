'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, Loader2, Plus, Send } from 'lucide-react';

import { getSmartTaskSuggestions } from '@/ai/flows/smart-task-suggestions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';

const suggestionSchema = z.object({
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
  recentHabits: z.string().min(10, 'Please describe your recent habits in a bit more detail.'),
});

type SuggestionFormValues = z.infer<typeof suggestionSchema>;

interface SmartSuggestionsProps {
    onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

export function SmartSuggestions({ onAddTask }: SmartSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      timeOfDay: 'morning',
      recentHabits: '',
    },
  });

  async function onSubmit(data: SuggestionFormValues) {
    setLoading(true);
    setSuggestions([]);
    try {
      const result = await getSmartTaskSuggestions(data);
      if (result && result.suggestedTasks) {
        setSuggestions(result.suggestedTasks);
      }
    } catch (error) {
      console.error('Failed to get smart suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem getting your suggestions. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddSuggestionAsTask = (title: string) => {
    onAddTask({ title, priority: 'medium', dueDate: new Date() });
    toast({
        title: "Task Added!",
        description: `"${title}" has been added to your task list.`
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline">Smart Suggestions</CardTitle>
        </div>
        <CardDescription>
          Feeling stuck? Get AI-powered suggestions for tasks you might have forgotten.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="recentHabits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What have you been up to?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Just finished a big report, went for a run, and had lunch."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(suggestions.length > 0) && (
        <CardContent>
            <h4 className="font-semibold mb-2">Here are some ideas:</h4>
            <ul className="grid gap-2">
                {suggestions.map((s, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-secondary/50">
                        <span className="text-sm">{s}</span>
                        <Button size="sm" variant="outline" onClick={() => handleAddSuggestionAsTask(s)}>
                            <Plus className="h-4 w-4 mr-1"/> Add
                        </Button>
                    </li>
                ))}
            </ul>
        </CardContent>
      )}
    </Card>
  );
}
