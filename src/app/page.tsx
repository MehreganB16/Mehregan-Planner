'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, FolderOpen, LogOut } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp, serverTimestamp, orderBy } from 'firebase/firestore';


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
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';

export type SortOption = 'dueDate' | 'createdAt' | 'priority';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            return {
                id: doc.id,
                ...data,
                dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
                completionDate: data.completionDate ? (data.completionDate as Timestamp).toDate() : undefined,
                createdAt: createdAtTimestamp ? createdAtTimestamp.toDate() : new Date(),
            } as Task
        });
        setTasks(tasksData);
      };
      fetchTasks();
    }
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    const newTaskPayload = { 
        ...taskData, 
        completed: false, 
        createdAt: serverTimestamp(),
        userId: user.uid,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
    };
    try {
        const docRef = await addDoc(collection(db, "tasks"), newTaskPayload);
        const newTask: Task = { 
            ...taskData, 
            id: docRef.id, 
            completed: false, 
            createdAt: new Date(),
            userId: user.uid,
        };
        setTasks(prev => [newTask, ...prev]);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
  };

  const addSubTasks = async (parentId: string, subTasks: Omit<Task, 'id' | 'completed' | 'parentId' | 'createdAt' | 'userId'>[]) => {
    if (!user) return;
    const newSubTasks: Task[] = [];
    for (const subTask of subTasks) {
        const subTaskPayload = {
            ...subTask,
            completed: false,
            parentId: parentId,
            createdAt: serverTimestamp(),
            userId: user.uid,
            dueDate: subTask.dueDate ? Timestamp.fromDate(subTask.dueDate) : null,
        }
        try {
            const docRef = await addDoc(collection(db, "tasks"), subTaskPayload);
            newSubTasks.push({
                ...subTask,
                id: docRef.id,
                completed: false,
                parentId: parentId,
                createdAt: new Date(),
                userId: user.uid,
            });
        } catch(e) {
            console.error("Error adding subtask: ", e)
        }
    }
    setTasks(prev => [...prev, ...newSubTasks]);
  };

  const updateTask = async (updatedTask: Task) => {
    const taskDocRef = doc(db, 'tasks', updatedTask.id);
    const { id, ...taskData } = updatedTask;
    try {
        await updateDoc(taskDocRef, {
            ...taskData,
            dueDate: updatedTask.dueDate ? Timestamp.fromDate(updatedTask.dueDate) : null,
            completionDate: updatedTask.completionDate ? Timestamp.fromDate(updatedTask.completionDate) : null,
        });
        setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    } catch(e) {
        console.error("Error updating task: ", e)
    }
  };

  const deleteTask = async (id: string) => {
    const childTasks = tasks.filter(task => task.parentId === id);
    for (const child of childTasks) {
        await deleteDoc(doc(db, 'tasks', child.id));
    }
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(prev => prev.filter(task => task.id !== id && task.parentId !== id));
  };

  const toggleTask = async (id: string) => {
    const taskToToggle = tasks.find(task => task.id === id);
    if (taskToToggle) {
        const isCompleted = !taskToToggle.completed;
        const completionDate = isCompleted ? Timestamp.now() : null;
        const taskDocRef = doc(db, 'tasks', id);
        await updateDoc(taskDocRef, { 
            completed: isCompleted,
            completionDate: completionDate
        });
        
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                return { 
                    ...task, 
                    completed: isCompleted,
                    completionDate: isCompleted ? new Date() : undefined,
                };
            }
            return task;
        }));
    }
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

      switch (sortOption) {
        case 'dueDate':
          return filtered.sort((a, b) => (a.dueDate && b.dueDate) ? a.dueDate.getTime() - b.dueDate.getTime() : a.dueDate ? -1 : 1);
        case 'createdAt':
          return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        case 'priority':
          return filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        default:
          return filtered;
      }
  }, [tasks, filterStatus, filterPriority, sortOption]);

  const saveTasksToFile = () => {
    const data = JSON.stringify(tasks.map(({userId, ...task}) => task), null, 2);
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
    if (file && user) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importedTasks = JSON.parse(content);
          if (Array.isArray(importedTasks)) {
             const newTasks: Omit<Task, 'id' | 'userId'>[] = importedTasks.map((t: any) => ({
                title: t.title,
                description: t.description,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                priority: t.priority,
                completed: t.completed,
                parentId: t.parentId,
                completionDate: t.completionDate ? new Date(t.completionDate) : undefined,
                createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
             }));
             for (const task of newTasks) {
                await addTask(task);
             }
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


  if (!isMounted || loading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Icons.logo className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Icons.logo className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">Mehregan Planner</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
              <ThemeToggle />
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
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut />
              </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 items-start gap-12 p-4 lg:grid-cols-3 lg:p-8">
            <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
                <ProductivityDashboard tasks={tasks} />
                <Separator />
                <TaskFilters 
                    status={filterStatus}
                    onStatusChange={setFilterStatus}
                    priority={filterPriority}
                    onPriorityChange={setFilterPriority}
                    sortOption={sortOption}
                    onSortOptionChange={setSortOption}
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
            </div>
            <div className="hidden lg:block lg:sticky top-24">
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
