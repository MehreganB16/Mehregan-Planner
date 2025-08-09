"use client"

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Task, Constraint } from '@/lib/types';
import { suggestOptimalSchedule, type SuggestOptimalScheduleOutput } from '@/ai/flows/suggest-optimal-schedule';
import { Bot, PlusCircle, Trash2, Check, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';

interface AiSchedulerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tasks: Task[];
  onSchedule: (tasks: Task[]) => void;
}

const dayOfWeekOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export default function AiScheduler({ isOpen, setIsOpen, tasks, onSchedule }: AiSchedulerProps) {
  const { toast } = useToast();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [newConstraint, setNewConstraint] = useState<Omit<Constraint, 'id'>>({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    description: 'Work Hours',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleSuggestion, setScheduleSuggestion] = useState<SuggestOptimalScheduleOutput | null>(null);

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleAddConstraint = () => {
    if (!newConstraint.startTime || !newConstraint.endTime) {
        toast({ variant: 'destructive', title: 'Invalid time', description: 'Please enter both start and end times.' });
        return;
    }
    setConstraints((prev) => [...prev, { ...newConstraint, id: crypto.randomUUID() }]);
  };

  const handleRemoveConstraint = (constraintId: string) => {
    setConstraints((prev) => prev.filter((c) => c.id !== constraintId));
  };

  const handleGenerateSchedule = async () => {
    if (selectedTasks.length === 0) {
      toast({ variant: 'destructive', title: 'No tasks selected' });
      return;
    }

    setIsLoading(true);
    setScheduleSuggestion(null);

    const tasksToSchedule = tasks
      .filter((t) => selectedTasks.includes(t.id))
      .map((t) => ({ name: t.title, duration: t.duration, priority: t.priority }));

    try {
      const result = await suggestOptimalSchedule({ tasks: tasksToSchedule, constraints });
      setScheduleSuggestion(result);
    } catch (error) {
      console.error('AI Schedule generation failed:', error);
      toast({ variant: 'destructive', title: 'Scheduling Failed', description: 'Could not generate a schedule. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const applySchedule = () => {
    if (!scheduleSuggestion) return;
  
    const dayNameToIndex: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
  
    const today = new Date();
    const currentDayIndex = today.getDay();
  
    const newTasks: Task[] = scheduleSuggestion.schedule.map(scheduledTask => {
      const originalTask = tasks.find(t => t.title === scheduledTask.taskName);
      const targetDayIndex = dayNameToIndex[scheduledTask.dayOfWeek];
      
      let date = new Date(today);
      const dayDifference = (targetDayIndex - currentDayIndex + 7) % 7;
      date.setDate(today.getDate() + dayDifference);
  
      const [startHour, startMinute] = scheduledTask.startTime.split(':').map(Number);
      date.setHours(startHour, startMinute, 0, 0);
  
      return {
        id: crypto.randomUUID(),
        title: scheduledTask.taskName,
        date: date,
        duration: originalTask?.duration || 60,
        priority: originalTask?.priority || 'medium',
        recurring: 'none',
        description: `Scheduled by AI. Original task: ${originalTask?.title || 'N/A'}`
      };
    });
  
    onSchedule(newTasks);
    toast({ title: 'Schedule Applied!', description: `${newTasks.length} tasks have been added to your calendar.` });
    setIsOpen(false);
    setScheduleSuggestion(null);
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Bot className="mr-2"/> AI Scheduler</DialogTitle>
          <DialogDescription>
            Select tasks and define your constraints, and let AI build an optimal schedule for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-1 min-h-0">
          {/* Left Panel: Tasks and Constraints */}
          <div className="space-y-6 flex flex-col">
            <div>
              <Label className="text-base font-semibold">1. Select Tasks to Schedule</Label>
              <ScrollArea className="h-48 mt-2 p-3 border rounded-md">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox id={`task-${task.id}`} onCheckedChange={() => handleToggleTask(task.id)} />
                    <label htmlFor={`task-${task.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {task.title} ({task.duration} min)
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            <div className="flex-1 flex flex-col">
              <Label className="text-base font-semibold">2. Define Constraints</Label>
              <p className="text-sm text-muted-foreground">Add your appointments or unavailable times.</p>
              <div className="grid grid-cols-3 gap-2 my-2">
                <Select value={newConstraint.dayOfWeek} onValueChange={(val) => setNewConstraint(p => ({...p, dayOfWeek: val as any}))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{dayOfWeekOptions.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="time" value={newConstraint.startTime} onChange={(e) => setNewConstraint(p => ({...p, startTime: e.target.value}))}/>
                <Input type="time" value={newConstraint.endTime} onChange={(e) => setNewConstraint(p => ({...p, endTime: e.target.value}))}/>
                <Input className="col-span-3" placeholder="Description (e.g., Doctor's appointment)" value={newConstraint.description} onChange={(e) => setNewConstraint(p => ({...p, description: e.target.value}))}/>
              </div>
              <Button onClick={handleAddConstraint} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Constraint</Button>
              <ScrollArea className="h-32 mt-2 p-1">
                 {constraints.map(c => (
                     <div key={c.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted">
                         <div>
                             <p className="font-medium">{c.description || `${c.dayOfWeek} Block`}</p>
                             <p className="text-muted-foreground">{c.dayOfWeek}, {c.startTime} - {c.endTime}</p>
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveConstraint(c.id)}><Trash2 className="h-4 w-4"/></Button>
                     </div>
                 ))}
              </ScrollArea>
            </div>
          </div>
          
          {/* Right Panel: Results */}
          <div className="border-l pl-6 flex flex-col">
             <Label className="text-base font-semibold">3. Review Suggested Schedule</Label>
             <div className="flex-1 mt-2 p-3 border rounded-md bg-muted/50 flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center text-muted-foreground">
                        <Bot className="mx-auto h-12 w-12 animate-pulse"/>
                        <p>Our AI is thinking...</p>
                    </div>
                ) : scheduleSuggestion ? (
                    <ScrollArea className="h-full w-full">
                        <h3 className="font-semibold mb-2">Suggested Schedule:</h3>
                        <p className="text-sm text-muted-foreground mb-4">{scheduleSuggestion.reasoning}</p>
                        <div className="space-y-2">
                        {scheduleSuggestion.schedule.map((item, idx) => (
                            <div key={idx} className="p-2 bg-background rounded-md text-sm">
                                <p className="font-semibold">{item.taskName}</p>
                                <p className="text-muted-foreground">{item.dayOfWeek}, {item.startTime} - {item.endTime}</p>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>Your AI-powered schedule will appear here.</p>
                    </div>
                )}
             </div>
          </div>
        </div>
        
        <Separator />

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          {scheduleSuggestion ? (
            <Button onClick={applySchedule}>
              <Check className="mr-2 h-4 w-4" /> Apply Schedule
            </Button>
          ) : (
            <Button onClick={handleGenerateSchedule} disabled={isLoading || selectedTasks.length === 0}>
              <Wand2 className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              {isLoading ? 'Generating...' : 'Generate Schedule'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
