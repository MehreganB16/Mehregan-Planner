
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Save, FolderOpen, MoreVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import type { Task, Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { TaskList } from '@/components/task-list';
import { TaskFilters } from '@/components/task-filters';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProductivityDashboard } from '@/components/productivity-dashboard';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FocusCoach } from '@/components/focus-coach';

export type SortOption = 'dueDate' | 'createdAt' | 'priority' | 'completionDate';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
        const savedTasks = localStorage.getItem('mehregan_planner_tasks');
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            // Convert date strings back to Date objects
            const tasksWithDates = parsedTasks.map((task: any) => ({
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                completionDate: task.completionDate ? new Date(task.completionDate) : undefined,
                createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
            }));
            setTasks(tasksWithDates);
        }
    } catch (error) {
        console.error("Failed to load tasks from local storage", error);
        toast({
            variant: "destructive",
            title: "Could not load tasks",
            description: "There was an error loading your tasks from local storage.",
        });
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted) {
        try {
            localStorage.setItem('mehregan_planner_tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error("Failed to save tasks to local storage", error);
            toast({
                variant: "destructive",
                title: "Could not save tasks",
                description: "There was an error saving your tasks.",
            });
        }
    }
  }, [tasks, isMounted, toast]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = { 
        ...taskData, 
        id: uuidv4(), 
        completed: false, 
        createdAt: new Date() 
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addSubTasks = (parentId: string, subTasks: Omit<Task, 'id' | 'completed' | 'parentId' | 'createdAt'>[]) => {
    const newSubTasks: Task[] = subTasks.map(subTask => ({
        ...subTask,
        id: uuidv4(),
        completed: false,
        parentId: parentId,
        createdAt: new Date(),
    }));
    setTasks(prev => [...prev, ...newSubTasks]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (id: string) => {
    // Also delete all sub-tasks
    const subTaskIds = tasks.filter(task => task.parentId === id).map(t => t.id);
    setTasks(prev => prev.filter(task => task.id !== id && !subTaskIds.includes(task.id)));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
        if (task.id === id) {
            const isCompleted = !task.completed;
            const existingTask = tasks.find(t => t.id === id);
            // If the task had a completion date before, don't just overwrite it.
            // Let the user edit it if they need to.
            // Only set a new completion date if it didn't have one.
            const completionDate = isCompleted 
                ? (existingTask?.completionDate || new Date()) 
                : undefined;

            return { 
                ...task, 
                completed: isCompleted,
                completionDate: completionDate,
            };
        }
        return task;
    }));
  };

const priorityOrder: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
        const statusMatch = filterStatus === 'all' ||
          (filterStatus === 'completed' && task.completed) ||
          (filterStatus === 'active' && !task.completed);
        
        const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;

        return statusMatch && priorityMatch;
      });

      return filtered.sort((a, b) => {
        switch (sortOption) {
            case 'priority':
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'dueDate':
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.getTime() - b.dueDate.getTime();
            case 'completionDate':
                if (!a.completionDate) return 1;
                if (!b.completionDate) return -1;
                return b.completionDate.getTime() - a.completionDate.getTime();
            case 'createdAt':
            default:
                return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
      
  }, [tasks, filterStatus, filterPriority, sortOption]);

  const saveTasksToFile = () => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mehregan_planner_tasks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Tasks Saved!', description: 'Your tasks have been saved to a JSON file.' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const importTasksFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedTasks = JSON.parse(content);
          if (Array.isArray(importedTasks)) {
             const newTasks: Task[] = importedTasks.map((t: any) => ({
                id: t.id || uuidv4(),
                title: t.title,
                description: t.description,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                priority: t.priority,
                completed: t.completed,
                parentId: t.parentId,
                completionDate: t.completionDate ? new Date(t.completionDate) : undefined,
                createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
             }));
             // Basic validation, you might want more robust checking
             if(newTasks.every(t => t.title && t.priority)) {
                setTasks(prev => [...prev, ...newTasks]);
                toast({ title: 'Tasks Imported!', description: 'New tasks have been added to your list.' });
             } else {
                throw new Error('Invalid task structure in JSON file.');
             }
          } else {
            throw new Error('Invalid JSON format');
          }
        } catch (error) {
          console.error("Failed to import tasks:", error);
          toast({ variant: 'destructive', title: 'Import Failed', description: 'The selected file is not a valid task JSON file.' });
        }
      };
      reader.readAsText(file);
    }
     // Reset file input
     if(event.target) {
        event.target.value = '';
    }
  };


  if (!isMounted) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Icons.logo className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center space-x-2 px-4 sm:space-x-4">
          <div className="flex flex-1 items-center gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground truncate">Mehregan Planner</h1>
          </div>
          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
              <ThemeToggle />
              
              <div className="hidden sm:flex space-x-2">
                  <Button variant="outline" size="sm" onClick={saveTasksToFile}>
                      <Save className="mr-2 h-4 w-4"/>
                      Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportClick}>
                      <FolderOpen className="mr-2 h-4 w-4"/>
                      Import
                  </Button>
              </div>

              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="sm:hidden">
                          <MoreVertical className="h-5 w-5"/>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={saveTasksToFile}>
                          <Save className="mr-2 h-4 w-4"/>
                          <span>Save Tasks</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleImportClick}>
                          <FolderOpen className="mr-2 h-4 w-4"/>
                          <span>Import Tasks</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>

              <input type="file" ref={fileInputRef} onChange={importTasksFromFile} accept="application/json" className="hidden"/>
              <AddTaskDialog onTaskSave={addTask}>
                <Button size="sm">
                  <Plus className="mr-0 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Task</span>
                </Button>
              </AddTaskDialog>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 items-start gap-8 p-4 md:p-6 lg:grid-cols-3 lg:gap-12">
            <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
                <ProductivityDashboard tasks={tasks} />
                <Separator />
                <TaskFilters 
                    status={filterStatus}
                    onStatusChange={setFilterStatus}
                    priority={filterPriority}
                    onPriorityChange={setFilterPriority}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                />
                <TaskList
                    tasks={filteredTasks}
                    allTasks={tasks}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    onUpdateTask={updateTask}
                    onAddTask={addTask}
                    onAddSubTasks={addSubTasks}
                />
                 <div className="block lg:hidden space-y-8">
                    <FocusCoach tasks={tasks} />
                    <SmartSuggestions onAddTask={addTask} />
                </div>
            </div>
            <div className="hidden lg:block lg:sticky top-24 space-y-8">
                <FocusCoach tasks={tasks} />
                <SmartSuggestions onAddTask={addTask} />
            </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Mehregan. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
