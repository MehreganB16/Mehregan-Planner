"use client";

import * as React from 'react';
import type { Task, Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Download, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { add, sub, startOfToday, isPast, differenceInMilliseconds } from 'date-fns';

import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { TaskList } from '@/components/task-list';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { TaskFilters } from '@/components/task-filters';
import { ProductivityDashboard } from '@/components/productivity-dashboard';
import PlanRightLogo from '@/components/planright-logo';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import { ics } from 'ics';

export type SortOption = 'createdAt' | 'dueDate' | 'priority' | 'completionDate';

const getInitialTasks = (): Task[] => [
    {
        id: '1',
        title: 'Finalize Q3 marketing strategy',
        description: 'Review and approve the final draft of the Q3 marketing plan.',
        dueDate: add(new Date(), { days: 3 }),
        priority: 'high',
        completed: false,
        createdAt: sub(new Date(), { days: 2 }),
      },
      {
        id: '2',
        title: 'Develop new landing page design',
        description: 'Create mockups and prototypes for the new homepage.',
        dueDate: add(new Date(), { days: 7 }),
        priority: 'urgent',
        completed: false,
        createdAt: sub(new Date(), { days: 1 }),
      },
      {
        id: '3',
        title: 'Onboard new marketing intern',
        description: 'Prepare onboarding materials and schedule intro meetings.',
        dueDate: add(new Date(), { days: 1 }),
        priority: 'medium',
        completed: true,
        completionDate: new Date(),
        createdAt: sub(new Date(), { days: 5 }),
      },
      {
        id: '4',
        title: 'Plan team offsite event',
        description: 'Coordinate logistics, activities, and budget for the upcoming team offsite.',
        dueDate: add(new Date(), { days: 14 }),
        priority: 'medium',
        completed: false,
        createdAt: sub(new Date(), { days: 10 }),
        parentId: '1',
      },
      {
        id: '5',
        title: 'Fix login issue on mobile app',
        description: 'Investigate and resolve the reported login bug on iOS and Android.',
        dueDate: sub(new Date(), { days: 1 }),
        priority: 'high',
        completed: true,
        completionDate: new Date(),
        createdAt: new Date(),
      },
      {
        id: '6',
        title: 'Update customer support documentation',
        description: 'Add new section for the latest feature release.',
        priority: 'low',
        completed: true,
        completionDate: sub(new Date(), { days: 3 }),
        createdAt: sub(new Date(), { days: 8 }),
      },
      {
        id: '7',
        title: 'Call with the legal team',
        description: 'Discuss the new privacy policy updates.',
        dueDate: add(startOfToday(), { hours: 15 }),
        priority: 'urgent',
        completed: false,
        createdAt: sub(new Date(), { days: 1 }),
      },
  ];

const SidebarContent = ({ onTaskSave, onExport, onImport, onToggleNotifications, notificationsEnabled }: { 
    onTaskSave: (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void 
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleNotifications: () => void;
    notificationsEnabled: boolean;
}) => (
    <>
      <div className="flex items-center gap-2">
        <PlanRightLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter">PlanRight</h1>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col gap-2">
        <AddTaskDialog onTaskSave={onTaskSave}>
          <Button>
            <Plus className="mr-2" />
            Add New Task
          </Button>
        </AddTaskDialog>
        <Button variant="outline" onClick={onExport}>
            <Download className="mr-2"/>
            Export Tasks
        </Button>
        <Button variant="outline" asChild>
            <label htmlFor="import-tasks">
                <Upload className="mr-2"/>
                Import Tasks
                <input type="file" id="import-tasks" className="sr-only" accept=".json" onChange={onImport} />
            </label>
        </Button>
        { 'Notification' in window && (
          <Button variant="outline" onClick={onToggleNotifications}>
            {notificationsEnabled ? <BellOff className="mr-2" /> : <Bell className="mr-2" />}
            {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
          </Button>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs text-muted-foreground">&copy; 2025 Mehregan. All Rights Reserved.</p>
        <ThemeToggle />
      </div>
    </>
  );

export default function Home() {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'completed'>('active');
  const [priorityFilter, setPriorityFilter] = React.useState<Priority | 'all'>('all');
  const [sortOption, setSortOption] = React.useState<SortOption>('createdAt');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission | null>(null);
  const [notifiedTaskIds, setNotifiedTaskIds] = React.useState<Set<string>>(new Set());
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    audioRef.current = new Audio('/alarm.mp3');
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (notificationPermission !== 'granted' || !tasks) return;

      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate && !task.completed && !notifiedTaskIds.has(task.id)) {
            const dueDate = new Date(task.dueDate);
            if (differenceInMilliseconds(dueDate, now) <= 0) {
              const notification = new Notification('Task Due: ' + task.title, {
                body: task.description || 'Your task is now due. Don\'t forget to complete it!',
                icon: '/logo.png', 
                requireInteraction: true,
              });
              
              notification.onclick = () => {
                window.focus();
              };

              audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
              setNotifiedTaskIds(prev => new Set(prev).add(task.id));
          }
        }
      });
    }, 1000 * 30); 

    return () => clearInterval(interval);
  }, [tasks, notificationPermission, notifiedTaskIds]);


  const handleRequestNotificationPermission = () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser does not support desktop notifications.",
        variant: "destructive",
      });
      return;
    }

    if (notificationPermission === 'granted') {
         toast({
            title: "Notifications are already enabled!",
        });
        return;
    }
    
    if (notificationPermission === 'denied') {
        toast({
            title: "Notifications are blocked",
            description: "Please enable notifications for this site in your browser settings.",
            variant: "destructive",
        });
        return;
    }

    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled!",
          description: "You'll be notified when tasks are due.",
        });
        new Notification('PlanRight', {
            body: 'Notifications have been successfully enabled!',
            icon: '/logo.png',
        });
      } else {
        toast({
          title: "Notifications Denied",
          description: "You won't receive notifications for due tasks.",
          variant: 'destructive'
        });
      }
    });
  };


  React.useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completionDate: task.completionDate ? new Date(task.completionDate) : undefined,
          createdAt: new Date(task.createdAt),
        }));
        setTasks(parsedTasks);
      } else {
        setTasks(getInitialTasks());
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
      setTasks(getInitialTasks());
    }
  }, []);

  React.useEffect(() => {
    if (tasks !== null) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddToCalendar = (task: Pick<Task, 'title' | 'description' | 'dueDate'>) => {
    if (!task.dueDate) return;

    const event = {
        title: task.title,
        description: task.description,
        start: [task.dueDate.getUTCFullYear(), task.dueDate.getUTCMonth() + 1, task.dueDate.getUTCDate(), task.dueDate.getUTCHours(), task.dueDate.getUTCMinutes()],
        duration: { hours: 1 },
    };

    ics.createEvent(event, (error, value) => {
        if (error) {
            console.error(error);
            toast({
                title: "Error creating calendar event",
                variant: "destructive",
            });
            return;
        }

        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${task.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
  }

  const handleAddTask = (data: Omit<Task, 'id' | 'completed' | 'createdAt'> & { dueTime?: string }) => {
    const newTask: Task = {
      ...data,
      id: uuidv4(),
      completed: false,
      createdAt: new Date(),
    };
    setTasks(prev => (prev ? [...prev, newTask] : [newTask]));
    
    if (newTask.dueDate && data.dueTime) {
      toast({
          title: "Task Added!",
          description: `"${newTask.title}" has been successfully added.`,
          action: (
              <Button variant="outline" size="sm" onClick={() => handleAddToCalendar(newTask)}>
                  Add to Calendar
              </Button>
          ),
      });
    } else {
       toast({
          title: "Task Added!",
          description: `"${newTask.title}" has been successfully added.`,
      });
    }

    if (isMobile) setIsSheetOpen(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev ? prev.map(task => (task.id === updatedTask.id ? updatedTask : task)) : []);
    toast({
        title: 'Task Updated!',
        description: `"${updatedTask.title}" has been updated.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks?.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev ? prev.filter(t => t.id !== taskId && t.parentId !== taskId) : []);
    
    toast({
        title: 'Task Deleted',
        description: `"${taskToDelete.title}" and its subtasks have been deleted.`,
        variant: 'destructive'
    });
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev ? prev.map(task => {
        if (task.id === taskId) {
          const isCompleted = !task.completed;
          return {
            ...task,
            completed: isCompleted,
            completionDate: isCompleted ? new Date() : undefined,
          };
        }
        return task;
      }) : []
    );
  };

  const handleAddSubTasks = (parentId: string, subTasksData: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => {
    const newSubTasks: Task[] = subTasksData.map(data => ({
        ...data,
        id: uuidv4(),
        completed: false,
        createdAt: new Date(),
        parentId: parentId,
    }));

    setTasks(prev => prev ? [...prev, ...newSubTasks] : newSubTasks);
  };

  const handleExportTasks = () => {
    if (!tasks) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(tasks, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "planright_tasks.json";
    link.click();
    toast({
        title: "Export Successful",
        description: "Your tasks have been downloaded.",
    });
  };

  const handleImportTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File is not valid text");
            }
            const importedTasks = JSON.parse(text);
            
            // Basic validation
            if (Array.isArray(importedTasks) && importedTasks.every(t => 'id' in t && 'title' in t)) {
                 const parsedTasks = importedTasks.map((task: any) => ({
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                    completionDate: task.completionDate ? new Date(task.completionDate) : undefined,
                    createdAt: new Date(task.createdAt),
                }));
                setTasks(parsedTasks);
                toast({
                    title: "Import Successful",
                    description: `${parsedTasks.length} tasks have been imported.`,
                });
            } else {
                throw new Error("Invalid JSON format for tasks.");
            }
        } catch (error) {
            console.error("Failed to import tasks:", error);
            toast({
                title: "Import Failed",
                description: "The selected file is not a valid task list.",
                variant: "destructive",
            });
        }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-importing the same file
    event.target.value = '';
    if (isMobile) setIsSheetOpen(false);
  };


  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    let filtered = tasks || [];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => (statusFilter === 'completed' ? task.completed : !task.completed));
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    return filtered;

  }, [tasks, statusFilter, priorityFilter]);

  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
        switch(sortOption) {
            case 'createdAt':
                return b.createdAt.getTime() - a.createdAt.getTime();
            case 'dueDate':
                return (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity);
            case 'priority':
                const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            case 'completionDate':
                return (b.completionDate?.getTime() || 0) - (a.completionDate?.getTime() || 0);
            default:
                return 0;
        }
    });
  }, [filteredTasks, sortOption]);

  if (tasks === null) {
    return null; // or a loading spinner
  }

  const sidebar = <SidebarContent onTaskSave={handleAddTask} onExport={handleExportTasks} onImport={handleImportTasks} onToggleNotifications={handleRequestNotificationPermission} notificationsEnabled={notificationPermission === 'granted'} />;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen w-full bg-muted/40">
        {!isMobile && (
          <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
            {sidebar}
          </aside>
        )}
        <div className="flex flex-1 flex-col">
            {isMobile && (
                <Header>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <PanelLeft />
                                <span className="sr-only">Open Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                           {sidebar}
                        </SheetContent>
                    </Sheet>
                    <div className="flex items-center gap-2">
                        <PlanRightLogo className="h-6 w-6 text-primary" />
                        <h1 className="text-lg font-semibold tracking-tighter">PlanRight</h1>
                    </div>
                     <AddTaskDialog onTaskSave={handleAddTask}>
                        <Button variant="ghost" size="icon">
                            <Plus />
                            <span className="sr-only">Add Task</span>
                        </Button>
                    </AddTaskDialog>
                </Header>
            )}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {!isMobile && (
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                          <p className="text-muted-foreground">Here is your organized task list.</p>
                        </div>
                         {notificationPermission !== 'granted' && 'Notification' in window && (
                          <Button onClick={handleRequestNotificationPermission}>
                              <Bell className="mr-2"/> Enable Notifications
                          </Button>
                        )}
                    </div>
                )}
                <ProductivityDashboard tasks={tasks} />
                <div className="mt-6">
                    <TaskFilters 
                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        priority={priorityFilter}
                        onPriorityChange={setPriorityFilter}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                    />
                </div>
                <div className="mt-6">
                    <TaskList
                        tasks={sortedTasks}
                        allTasks={tasks}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateTask={handleUpdateTask}
                        onAddSubTasks={handleAddSubTasks}
                    />
                </div>
            </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
