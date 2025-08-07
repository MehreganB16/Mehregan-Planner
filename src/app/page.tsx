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
  { id: '1753319636547', title: 'Applying for university', description: '', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319868369', title: 'UcBrekely', description: 'Subtask of: Applying for university', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319876836', title: 'KTH', description: 'Subtask of: Applying for university', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319882917', title: 'Lund', description: 'Subtask of: Applying for university', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319892168', title: 'KuLueavan', description: 'Subtask of: Applying for university', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319913851', title: 'KuLueavan BOFzag', description: 'Subtask of: Applying for university', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319926320', title: 'Paul Curran', description: '', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319941618', title: 'Measurement details', description: 'Subtask of: Paul Curran', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753319962418', title: 'Tapeout details planning', description: 'Subtask of: Paul Curran', dueDate: undefined, priority: 'high', completed: false },
  { id: '1753320002265', title: 'Text to Flavio for infenion', description: '', dueDate: undefined, priority: 'low', completed: false },
  { id: '1753320181480', title: 'Measurement Sawek', description: '', dueDate: undefined, priority: 'medium', completed: false },
  { id: '1753345403523', title: 'Sending complaint to Catherine', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true },
  { id: '1753347417264', title: 'Apply to industrial position', description: '', dueDate: undefined, priority: 'low', completed: false },
  { id: '1753347427190', title: 'Infenion', description: 'Subtask of: Apply to industrial position', dueDate: undefined, priority: 'low', completed: false },
  { id: '1753347439654', title: 'Qorvo', description: 'Subtask of: Apply to industrial position', dueDate: undefined, priority: 'low', completed: false },
  { id: '1753352041996', title: 'Update EI Application', description: '', dueDate: undefined, priority: 'medium', completed: false },
  { id: '1753363207198', title: 'جواب ایمیل سلندا تیندر', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true },
  { id: '1753363824852', title: 'Email to head of kulueaven for application', description: '', dueDate: undefined, priority: 'urgent', completed: false },
  { id: '1753394006888', title: 'Applyin 4 University position', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753394021924', title: 'UC Brekeley-22Sep2025', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753394043380', title: 'KU Luaven BOFZAP-2Sep2025', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753394052651', title: 'KTH-15sep2025', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753394064746', title: 'Lund', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753784648738', title: 'KTH2-28Aug25', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753784661399', title: 'UC Irvine-10oct25', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753784670885', title: 'Toronto-30oct25', description: 'Subtask of: Applyin 4 University position', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753394110594', title: 'Paul Curran', description: '', dueDate: new Date('2025-08-06'), priority: 'high', completed: false },
  { id: '1753394128063', title: 'Measurement details', description: 'Subtask of: Paul Curran', dueDate: new Date('2025-08-06'), priority: 'high', completed: false },
  { id: '1753394154224', title: 'Tapeout details', description: 'Subtask of: Paul Curran', dueDate: new Date('2025-08-06'), priority: 'high', completed: false },
  { id: '1753394184400', title: 'Email 2 head of Elec dep-Lueven for host letter', description: '', dueDate: new Date('2025-07-25'), priority: 'urgent', completed: true },
  { id: '1753394254188', title: 'Apply for company', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
  { id: '1753480622517', title: 'Infinion', description: 'Subtask of: Apply for company', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
  { id: '1753394273188', title: 'Measurement slide 4 Sawek', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
  { id: '1753394293004', title: 'Email to Flavio 4 EI', description: '', dueDate: new Date('2025-08-06'), priority: 'low', completed: false },
  { id: '1753394413832', title: 'Email to union and confirm zoom meeting', description: '', dueDate: new Date('2025-07-25'), priority: 'high', completed: true },
  { id: '1753480695789', title: 'Email to Sandra for meeting next week', description: '', dueDate: new Date('2025-07-25'), priority: 'medium', completed: true },
  { id: '1753480814091', title: 'Send complaint to Catherine', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true },
  { id: '1753480974682', title: 'Email to Senad', description: '', dueDate: new Date('2025-07-24'), priority: 'high', completed: true },
  { id: '1753696512911', title: 'Ask People for recommendation for Berekwly&Lueven', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753696527564', title: 'Paul---he said yes', description: 'Subtask of: Ask People for recommendation for Berekwly&Lueven', dueDate: new Date('2025-07-28'), priority: 'urgent', completed: true },
  { id: '1753696544151', title: 'Peter----be avialabel after 30th of July', description: 'Subtask of: Ask People for recommendation for Berekwly&Lueven', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753696552939', title: 'Anding', description: 'Subtask of: Ask People for recommendation for Berekwly&Lueven', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753696596285', title: 'Ask for connectuon in KuLeven', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753696607803', title: 'Peter', description: 'Subtask of: Ask for connectuon in KuLeven', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753696615600', title: 'Anding', description: 'Subtask of: Ask for connectuon in KuLeven', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1753708014835', title: 'Adjust EI application based on fb from companies especially in market targeting', description: '', dueDate: new Date('2025-08-06'), priority: 'low', completed: false },
  { id: '1753708049307', title: 'Email to david EI confirm his email', description: '', dueDate: new Date('2025-07-28'), priority: 'medium', completed: true },
  { id: '1753713707963', title: 'Email senad to disscuse next meeting', description: '', dueDate: new Date('2025-07-28'), priority: 'low', completed: true },
  { id: '1753713871236', title: 'Make slide to meet with Seenad', description: '', dueDate: new Date('2025-08-06'), priority: 'medium', completed: false },
  { id: '1753798560505', title: 'Send complaint to d&r ', description: '', dueDate: new Date('2025-08-06'), priority: 'high', completed: false },
  { id: '1753872893480', title: 'Email to Aiofe', description: '', dueDate: new Date('2025-07-30'), priority: 'urgent', completed: true },
  { id: '1753872922104', title: 'Email to oran', description: '', dueDate: new Date('2025-07-30'), priority: 'high', completed: true },
  { id: '1753872943861', title: 'Follow up email to Emma', description: '', dueDate: new Date('2025-07-30'), priority: 'high', completed: true },
  { id: '1753872970642', title: 'Follow up email to head of Lueven', description: '', dueDate: new Date('2025-08-01'), priority: 'urgent', completed: true },
  { id: '1753875982293', title: 'Make the missing file list for paul', description: '', dueDate: new Date('2025-08-01'), priority: 'urgent', completed: true },
  { id: '1754421446321', title: 'Meeting with Emma', description: '', dueDate: new Date('2025-08-05'), priority: 'high', completed: true },
  { id: '1754421509329', title: 'Email to sandra cobfirmation', description: '', dueDate: new Date('2025-08-05'), priority: 'medium', completed: true },
  { id: '1754421553017', title: 'Meeting with Paul', description: '', dueDate: new Date('2025-08-05'), priority: 'high', completed: true },
  { id: '1754422118145', title: 'Emal to paul 4 cadence files', description: '', dueDate: new Date('2025-08-06'), priority: 'urgent', completed: false },
  { id: '1754475239131', title: 'Meating with Aiofe', description: '', dueDate: new Date('2025-08-11'), priority: 'urgent', completed: false },
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

    