"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Download, Bot } from 'lucide-react';
import PlanRightLogo from '@/components/planright-logo';
import TaskDialog from '@/components/task-dialog';
import TaskCalendar from '@/components/task-calendar';
import AiScheduler from '@/components/ai-scheduler';
import { exportToIcs } from '@/lib/ical';
import { add, startOfWeek, sub } from 'date-fns';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design meeting',
      description: 'Discuss new dashboard design.',
      date: new Date(),
      duration: 60,
      priority: 'high',
      recurring: 'none',
    },
    {
      id: '2',
      title: 'Lunch with a client',
      description: 'Finalize the Q3 contract.',
      date: add(new Date(), { days: 2 }),
      duration: 90,
      priority: 'medium',
      recurring: 'none',
    },
    {
      id: '3',
      title: 'Weekly sync',
      description: 'Team-wide weekly synchronization meeting.',
      date: startOfWeek(new Date(), { weekStartsOn: 1 }),
      duration: 45,
      priority: 'medium',
      recurring: 'weekly',
    },
    {
      id: '4',
      title: 'Submit report',
      description: 'Submit the monthly performance report.',
      date: sub(new Date(), { days: 1 }),
      duration: 120,
      priority: 'high',
      recurring: 'none',
    },
  ]);
  const [isClient, setIsClient] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAiSchedulerOpen, setIsAiSchedulerOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveTask = (task: Task) => {
    setTasks((prevTasks) => {
      const existingTaskIndex = prevTasks.findIndex((t) => t.id === task.id);
      if (existingTaskIndex > -1) {
        const newTasks = [...prevTasks];
        newTasks[existingTaskIndex] = task;
        return newTasks;
      }
      return [...prevTasks, task];
    });
    setIsTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setIsTaskDialogOpen(false);
    setSelectedTask(null);
  }

  const handleAddNewTask = () => {
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(
      (task) => new Date(task.date).toDateString() === selectedDate.toDateString()
    );
  }, [tasks, selectedDate]);

  return (
    <>
      <main className="min-h-screen w-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="flex items-center space-x-3 p-2">
              <PlanRightLogo className="h-10 w-10 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PlanRight</h1>
            </div>
            <div className="space-y-3 px-2">
              <Button onClick={handleAddNewTask} className="w-full" size="lg" variant="default">
                <CalendarPlus className="mr-2 h-5 w-5" />
                Add New Task
              </Button>
              <Button onClick={() => setIsAiSchedulerOpen(true)} className="w-full" size="lg" variant="secondary">
                <Bot className="mr-2 h-5 w-5" />
                AI Scheduler
              </Button>
              {isClient && (
                 <Button onClick={() => exportToIcs(tasks)} className="w-full" size="lg" variant="outline">
                   <Download className="mr-2 h-5 w-5" />
                   Export Schedule
                 </Button>
              )}
            </div>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-8 xl:col-span-9">
            <TaskCalendar
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEditTask={handleEditTask}
            />
          </div>
        </div>
      </main>

      <TaskDialog
        isOpen={isTaskDialogOpen}
        setIsOpen={setIsTaskDialogOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        selectedDate={selectedDate}
      />
      
      <AiScheduler 
        isOpen={isAiSchedulerOpen}
        setIsOpen={setIsAiSchedulerOpen}
        tasks={tasks}
        onSchedule={(newTasks) => setTasks(prev => [...prev, ...newTasks])}
      />
    </>
  );
}
