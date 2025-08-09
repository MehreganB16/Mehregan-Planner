"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Sparkles, Trash2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { suggestRelatedTasks } from '@/ai/flows/suggest-related-tasks';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  task: Task | null;
  selectedDate?: Date;
}

const taskSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().optional(),
  date: z.date({ required_error: 'A date is required.' }),
  duration: z.coerce.number().min(1, { message: 'Duration must be at least 1 minute.' }),
  priority: z.enum(['low', 'medium', 'high']),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly']),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskDialog({ isOpen, setIsOpen, onSave, onDelete, task, selectedDate }: TaskDialogProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      date: selectedDate || new Date(),
      duration: 60,
      priority: 'medium',
      recurring: 'none',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        ...task,
        date: new Date(task.date),
      });
    } else {
      form.reset({
        title: '',
        description: '',
        date: selectedDate || new Date(),
        duration: 60,
        priority: 'medium',
        recurring: 'none',
      });
    }
    setAiSuggestions([]);
  }, [task, isOpen, form, selectedDate]);

  const onSubmit = (data: TaskFormData) => {
    onSave({
      id: task?.id || crypto.randomUUID(),
      ...data,
    });
    form.reset();
  };

  const handleAiSuggest = async () => {
    const planDescription = form.getValues('description') || form.getValues('title');
    if (!planDescription) {
        toast({
            variant: "destructive",
            title: "Cannot generate suggestions",
            description: "Please provide a title or description for the task.",
        });
        return;
    }
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
      const result = await suggestRelatedTasks({ planDescription });
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not generate suggestions. Please try again.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleAddSuggestionAsTask = (suggestion: string) => {
    onSave({
      id: crypto.randomUUID(),
      title: suggestion,
      date: form.getValues('date'),
      duration: 30,
      priority: 'medium',
      recurring: 'none',
    });
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
    toast({
        title: "Task Added!",
        description: `"${suggestion}" has been added to your schedule.`,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Team meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Discuss project milestones..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurring</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4">
                 <Button type="button" variant="outline" className="w-full" onClick={handleAiSuggest} disabled={isAiLoading}>
                     <Sparkles className={cn("mr-2 h-4 w-4", isAiLoading && "animate-spin")} />
                     {isAiLoading ? 'Generating...' : 'AI Suggestions for related tasks'}
                 </Button>
                 {aiSuggestions.length > 0 && (
                     <Alert>
                         <AlertTitle className="flex items-center"><Sparkles className="h-4 w-4 mr-2" /> AI Suggestions</AlertTitle>
                         <AlertDescription className="space-y-2 mt-2">
                            {aiSuggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-center justify-between gap-2">
                                    <span className="text-sm">{suggestion}</span>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => handleAddSuggestionAsTask(suggestion)}>
                                        Add
                                    </Button>
                                </div>
                            ))}
                         </AlertDescription>
                     </Alert>
                 )}
            </div>

            <DialogFooter className="pt-4">
                {task && (
                    <Button type="button" variant="destructive" onClick={() => onDelete(task.id)} className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                )}
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
