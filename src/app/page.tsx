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
import { ThemeToggle } from '@/components/theme-toggle';
import { ProductivityDashboard } from '@/components/productivity-dashboard';
import { Separator } from '@/components/ui/separator';

const initialTasks: Task[] = [
    { id: '1', title: 'Applying for university', description: '', dueDate: undefined, priority: 'high', completed: false },
    { id: '2', title: 'UcBrekely', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '1' },
    { id: '3', title: 'KTH', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '1' },
    { id: '4', title: 'Lund', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '1' },
    { id: '5', title: 'KuLueavan', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '1' },
    { id: '6', title: 'KuLueavan BOFzag', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '1' },
    { id: '7', title: 'Paul Curran', description: '', dueDate: undefined, priority: 'high', completed: false },
    { id: '8', title: 'Measurement details', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '7' },
    { id: '9', title: 'Tapeout details planning', description: '', dueDate: undefined, priority: 'high', completed: false, parentId: '7' },
    { id: '10', title: 'Text to Flavio for infenion', description: '', dueDate: undefined, priority: 'low', completed: false },
    { id: '11', title: 'Measurement Sawek', description: '', dueDate: undefined, priority: 'medium', completed: false },
    { id: '12', title: 'Sending complaint to Catherine', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '13', title: 'Apply to industrial position', description: '', dueDate: undefined, priority: 'low', completed: false },
    { id: '14', title: 'Infenion', description: '', dueDate: undefined, priority: 'low', completed: false, parentId: '13' },
    { id: '15', title: 'Qorvo', description: '', dueDate: undefined, priority: 'low', completed: false, parentId: '13' },
    { id: '16', title: 'Update EI Application', description: '', dueDate: undefined, priority: 'medium', completed: false },
    { id: '17', title: 'جواب ایمیل سلندا تیندر', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '18', title: 'Email to head of kulueaven for application', description: '', dueDate: undefined, priority: 'urgent', completed: false },
    { id: '19', title: 'Applyin 4 University position', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
    { id: '20', title: 'UC Brekeley-22Sep2025', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '21', title: 'KU Luaven BOFZAP-2Sep2025', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '22', title: 'KTH-15sep2025', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '23', title: 'Lund', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '24', title: 'KTH2-28Aug25', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '25', title: 'UC Irvine-10oct25', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '26', title: 'Toronto-30oct25', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '19' },
    { id: '27', title: 'Paul Curran', description: '', dueDate: new Date('2025-08-06'), priority: 'high', completed: false },
    { id: '28', title: 'Measurement details', description: '', dueDate: new Date('2025-08-06'), priority: 'high', completed: false, parentId: '27' },
    { id: '29', title: 'Tapeout details', description: '', dueDate: new Date('2025-08-06'), priority: 'high', completed: false, parentId: '27' },
    { id: '30', title: 'Email 2 head of Elec dep-Lueven for host letter', description: '', dueDate: new Date('2025-07-25'), priority: 'urgent', completed: true, completionDate: new Date() },
    { id: '31', title: 'Apply for company', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
    { id: '32', title: 'Infinion', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false, parentId: '31' },
    { id: '33', title: 'Measurement slide 4 Sawek', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
    { id: '34', title: 'Email to Flavio 4 EI', description: '', dueDate: new Date('2025-08-06'), priority: 'low', completed: false },
    { id: '35', title: 'Email to union and confirm zoom meeting', description: '', dueDate: new Date('2025-07-25'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '36', title: 'Email to Sandra for meeting next week', description: '', dueDate: new Date('2025-07-25'), priority: 'medium', completed: true, completionDate: new Date() },
    { id: '37', title: 'Send complaint to Catherine', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '38', title: 'Email to Senad', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '39', title: 'Ask People for recommendation for Berekwly&Lueven', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
    { id: '40', title: 'Paul---he said yes', description: '', dueDate: new Date('2025-07-28'), priority: 'urgent', completed: true, completionDate: new Date(), parentId: '39' },
    { id: '41', title: 'Peter----be avialabel after 30th of July', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '39' },
    { id: '42', title: 'Anding', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '39' },
    { id: '43', title: 'Ask for connectuon in KuLeven', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
    { id: '44', title: 'Peter', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '43' },
    { id: '45', title: 'Anding', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false, parentId: '43' },
    { id: '46', title: 'Adjust EI application based on fb from companies especially in market targeting', description: '', dueDate: new Date('2025-08-06'), priority: 'low', completed: false },
    { id: '47', title: 'Email to david EI confirm his email', description: '', dueDate: new Date('2025-07-28'), priority: 'medium', completed: true, completionDate: new Date() },
    { id: '48', title: 'Email senad to disscuse next meeting', description: '', dueDate: new Date('2025-07-28'), priority: 'low', completed: true, completionDate: new Date() },
    { id: '49', title: 'Make slide to meet with Seenad', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
    { id: '50', title: 'Send complaint to d&r ', description: '', dueDate: new Date('2025-08-06'), priority: 'high', completed: false },
    { id: '51', title: 'Email to Aiofe', description: '', dueDate: new Date('2025-07-30'), priority: 'urgent', completed: true, completionDate: new Date() },
    { id: '52', title: 'Email to oran', description: '', dueDate: new Date('2025-07-30'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '53', title: 'Follow up email to Emma', description: '', dueDate: new Date('2025-07-30'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '54', title: 'Follow up email to head of Lueven', description: '', dueDate: new Date('2025-08-01'), priority: 'urgent', completed: true, completionDate: new Date() },
    { id: '55', title: 'Make the missing file list for paul', description: '', dueDate: new Date('2025-08-01'), priority: 'urgent', completed: true, completionDate: new Date() },
    { id: '56', title: 'Meeting with Emma', description: '', dueDate: new Date('2025-08-05'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '57', title: 'Email to sandra cobfirmation', description: '', dueDate: new Date('2025-08-05'), priority: 'medium', completed: true, completionDate: new Date() },
    { id: '58', title: 'Meeting with Paul', description: '', dueDate: new Date('2025-08-05'), priority: 'high', completed: true, completionDate: new Date() },
    { id: '59', title: 'Emal to paul 4 cadence files', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
    { id: '60', title: 'Meating with Aiofe', description: '', dueDate: new Date('2025-08-11'), priority: 'urgent', completed: false },
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
        let tasksToSet = parsedTasks.map((t: any) => ({ ...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined, completionDate: t.completionDate ? new Date(t.completionDate) : undefined }));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        tasksToSet = tasksToSet.map((task: Task) => {
          if (!task.completed && task.dueDate && new Date(task.dueDate) < today) {
            return { ...task, dueDate: today };
          }
          return task;
        });

        setTasks(tasksToSet);
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

  const addSubTasks = (parentId: string, subTasks: Omit<Task, 'id' | 'completed' | 'parentId'>[]) => {
    const newSubTasks: Task[] = subTasks.map(subTask => ({
      ...subTask,
      id: uuidv4(),
      completed: false,
      parentId: parentId,
    }));
    setTasks(prev => [...prev, ...newSubTasks]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id && task.parentId !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
        if (task.id === id) {
            const isCompleted = !task.completed;
            return { 
                ...task, 
                completed: isCompleted,
                completionDate: isCompleted ? new Date() : undefined,
            };
        }
        return task;
    }));
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
             const newTasks = importedTasks.map((t: any) => ({ ...t, id: uuidv4(), dueDate: t.dueDate ? new Date(t.dueDate) : undefined, completionDate: t.completionDate ? new Date(t.completionDate) : undefined }));
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
    </div>
  );
}
