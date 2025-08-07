'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save, FolderOpen } from 'lucide-react';

import type { Task, Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { TaskList } from '@/components/task-list';
import { TaskFilters } from '@/components/task-filters';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

const initialTasks: Task[] = [
  { id: uuidv4(), title: 'Deploy critical bug fix', description: 'Deploy the patch to production servers immediately.', dueDate: new Date(), priority: 'urgent', completed: false },
  { id: uuidv4(), title: 'Finish project proposal', description: 'Complete the Q3 proposal for the marketing team.', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), priority: 'high', completed: false },
  { id: uuidv4(), title: 'Book dentist appointment', description: 'Routine check-up.', dueDate: undefined, priority: 'medium', completed: false },
  { id: uuidv4(), title: 'Grocery shopping', description: 'Milk, bread, eggs, and cheese.', dueDate: new Date(), priority: 'low', completed: true },
  { id: uuidv4(), title: 'Reply to client emails', description: 'Follow up with Acme Corp and Stark Industries.', dueDate: new Date(), priority: 'high', completed: false },
];


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all');
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const storedTasks = localStorage.getItem('taskwise-tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks.map((t: any) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined })));
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
        setTasks(initialTasks);
      }
    } else {
      setTasks(initialTasks);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('taskwise-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...taskData, id: uuidv4(), completed: false };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = filterStatus === 'all' ||
        (filterStatus === 'completed' && task.completed) ||
        (filterStatus === 'active' && !task.completed);
      
      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
      
      return statusMatch && priorityMatch;
    }).sort((a, b) => (a.dueDate && b.dueDate) ? a.dueDate.getTime() - b.dueDate.getTime() : a.dueDate ? -1 : 1);
  }, [tasks, filterStatus, filterPriority]);

  const saveTasksToFile = () => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskwise_tasks.json';
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
             const newTasks = importedTasks.map((t: any) => ({ ...t, id: uuidv4(), dueDate: t.dueDate ? new Date(t.dueDate) : undefined }));
             setTasks(currentTasks => [...currentTasks, ...newTasks]);
             toast({ title: 'Tasks Imported!', description: 'New tasks have been added to your list.' });
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
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Icons.logo className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">TaskWise</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
              <Button variant="outline" onClick={saveTasksToFile}>
                <Save className="mr-2 h-4 w-4"/>
                Save
              </Button>
              <Button variant="outline" onClick={handleImportClick}>
                <FolderOpen className="mr-2 h-4 w-4"/>
                Import
              </Button>
              <input type="file" ref={fileInputRef} onChange={importTasksFromFile} accept="application/json" className="hidden"/>
             <AddTaskDialog onTaskSave={addTask}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </AddTaskDialog>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 items-start gap-12 p-4 lg:grid-cols-3 lg:p-8">
            <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
                <TaskFilters 
                    status={filterStatus}
                    onStatusChange={setFilterStatus}
                    priority={filterPriority}
                    onPriorityChange={setFilterPriority}
                />
                <TaskList
                    tasks={filteredTasks}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    onUpdateTask={updateTask}
                />
            </div>
            <div className="hidden lg:block lg:sticky top-24">
                <SmartSuggestions onAddTask={addTask} />
            </div>
        </div>
      </main>
    </div>
  );
}
