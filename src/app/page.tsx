
"use client";

import * as React from 'react';
import type { Task, Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Download, Plus, Upload, Timer, AlertTriangle, ListFilter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { add, sub, startOfToday, isPast, differenceInMilliseconds } from 'date-fns';

import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { TaskList } from '@/components/task-list';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { TaskFilters } from '@/components/task-filters';
import { ProductivityDashboard } from '@/components/productivity-dashboard';
import BigAPlannerLogo from '@/components/bigaplanner-logo';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';
import * as ics from 'ics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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
        completed: false,
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

const SidebarContent = ({ 
    onTaskSave, 
    onExport, 
    onImport, 
    onToggleNotifications, 
    notificationsEnabled,
    notificationLeadTime,
    onLeadTimeChange,
}: { 
    onTaskSave: (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void 
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleNotifications: () => void;
    notificationsEnabled: boolean;
    notificationLeadTime: number;
    onLeadTimeChange: (value: string) => void;
}) => (
    <>
      <div className="flex items-center gap-2">
        <BigAPlannerLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter">BigAPlanner</h1>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col gap-4">
        <AddTaskDialog onTaskSave={onTaskSave}>
          <Button>
            <Plus className="mr-2" />
            Add New Task
          </Button>
        </AddTaskDialog>
        <div className="flex flex-col gap-2">
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
        </div>
        { 'Notification' in window && (
            <div className="space-y-2 rounded-lg border p-3">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <Button variant="outline" onClick={onToggleNotifications} className="w-full">
                    {notificationsEnabled ? <BellOff className="mr-2" /> : <Bell className="mr-2" />}
                    {notificationsEnabled ? 'Disable Alerts' : 'Enable Alerts'}
                </Button>
                <div className="space-y-1">
                    <Label htmlFor="lead-time" className="text-xs text-muted-foreground">Remind Me Before</Label>
                    <Select
                        value={String(notificationLeadTime)}
                        onValueChange={onLeadTimeChange}
                        disabled={!notificationsEnabled}
                    >
                        <SelectTrigger id="lead-time">
                            <Timer className="mr-2" />
                            <SelectValue placeholder="Select lead time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">At time of event</SelectItem>
                            <SelectItem value="60000">1 minute before</SelectItem>
                            <SelectItem value="300000">5 minutes before</SelectItem>
                            <SelectItem value="600000">10 minutes before</SelectItem>
                            <SelectItem value="1800000">30 minutes before</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
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
  const [showOnlyOverdue, setShowOnlyOverdue] = React.useState(false);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(false);
  const [notifiedTaskIds, setNotifiedTaskIds] = React.useState<Set<string>>(new Set());
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [notificationLeadTime, setNotificationLeadTime] = React.useState<number>(60000); // Default 1 minute
  const [dueTask, setDueTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
    const storedLeadTime = localStorage.getItem('notificationLeadTime');
    if (storedLeadTime) {
        setNotificationLeadTime(parseInt(storedLeadTime, 10));
    }
    const storedEnabled = localStorage.getItem('notificationsEnabled');
    // Only enable if permission has already been granted
    if (storedEnabled === 'true' && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
    } else {
        setNotificationsEnabled(false);
    }
    audioRef.current = new Audio('/alarm.mp3');
  }, []);
  
  React.useEffect(() => {
    if (dueTask) {
        audioRef.current?.play().catch(e => console.error('Error playing sound:', e));
    }
  }, [dueTask]);


  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationsEnabled || notificationPermission !== 'granted' || !tasks) return;

      const now = new Date();
      // Find the first task that is due but hasn't been notified yet
      const nextDueTask = tasks.find(task => {
          if (!task.dueDate || task.completed || notifiedTaskIds.has(task.id)) {
              return false;
          }
          const dueDate = new Date(task.dueDate);
          const timeDifference = differenceInMilliseconds(dueDate, now);
          // Check if it's due within the lead time, but also not already past the due date by more than the lead time
          return timeDifference > -notificationLeadTime && timeDifference <= notificationLeadTime;
      });

      if (nextDueTask && !dueTask && !notifiedTaskIds.has(nextDueTask.id)) {
          setDueTask(nextDueTask);
          setNotifiedTaskIds(prev => new Set(prev).add(nextDueTask.id));
      }
    }, 10000); // Check every 10 seconds for efficiency

    return () => clearInterval(interval);
  }, [tasks, notificationsEnabled, notificationPermission, notifiedTaskIds, notificationLeadTime, dueTask]);


  const handleToggleNotifications = () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser does not support desktop notifications.",
        variant: "destructive",
      });
      return;
    }
    
    if (notificationPermission === 'denied') {
        toast({
            title: "Notifications are blocked",
            description: "Please enable notifications for this site in your browser settings to use alerts.",
            variant: "destructive",
        });
        return;
    }

    if (notificationPermission === 'granted') {
        const newEnabledState = !notificationsEnabled;
        setNotificationsEnabled(newEnabledState);
        localStorage.setItem('notificationsEnabled', String(newEnabledState));
        toast({
            title: newEnabledState ? "In-App Alerts Enabled" : "In-App Alerts Disabled",
        });
        return;
    }

    if (notificationPermission === 'default') {
        Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                localStorage.setItem('notificationsEnabled', 'true');
                toast({
                    title: "In-App Alerts Enabled!",
                    description: "You'll be alerted when tasks are due.",
                });
            } else {
                setNotificationsEnabled(false);
                localStorage.setItem('notificationsEnabled', 'false');
                toast({
                    title: "Alerts Disabled",
                    description: "You won't receive alerts for due tasks.",
                    variant: 'destructive'
                });
            }
        });
    }
  };

  const handleLeadTimeChange = (value: string) => {
    const newLeadTime = parseInt(value, 10);
    setNotificationLeadTime(newLeadTime);
    localStorage.setItem('notificationLeadTime', String(newLeadTime));
  };


  React.useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          // Robustly parse dates, ensuring they are valid Date objects
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completionDate: task.completionDate ? new Date(task.completionDate) : undefined,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(), // Fallback for old data
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
    link.download = "bigaplanner_tasks.json";
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
            
            if (Array.isArray(importedTasks) && importedTasks.every(t => 'id' in t && 'title' in t)) {
                 const parsedTasks = importedTasks.map((task: any) => ({
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                    completionDate: task.completionDate ? new Date(task.completionDate) : undefined,
                    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
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
    event.target.value = '';
    if (isMobile) setIsSheetOpen(false);
  };

  const overdueTasks = React.useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => task.dueDate && !task.completed && isPast(new Date(task.dueDate)));
  }, [tasks]);


  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    let filtered = tasks || [];

    if (showOnlyOverdue) {
        return overdueTasks;
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => (statusFilter === 'completed' ? task.completed : !task.completed));
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    return filtered;

  }, [tasks, statusFilter, priorityFilter, showOnlyOverdue, overdueTasks]);

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
  
  const handleShowOverdue = () => {
    setShowOnlyOverdue(true);
    setStatusFilter('active');
    setPriorityFilter('all');
  };

  if (tasks === null) {
    return null; // or a loading spinner
  }

  const sidebar = <SidebarContent onTaskSave={handleAddTask} onExport={handleExportTasks} onImport={handleImportTasks} onToggleNotifications={handleToggleNotifications} notificationsEnabled={notificationsEnabled} notificationLeadTime={notificationLeadTime} onLeadTimeChange={handleLeadTimeChange} />;

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
                           <SheetHeader>
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                           </SheetHeader>
                           {sidebar}
                        </SheetContent>
                    </Sheet>
                    <div className="flex items-center gap-2">
                        <BigAPlannerLogo className="h-6 w-6 text-primary" />
                        <h1 className="text-lg font-semibold tracking-tighter">BigAPlanner</h1>
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
                    </div>
                )}
                {overdueTasks.length > 0 && !showOnlyOverdue && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}.</AlertTitle>
                    <AlertDescription>
                        <Button variant="link" className="p-0 h-auto" onClick={handleShowOverdue}>
                            <ListFilter className="mr-2" /> View them now
                        </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <ProductivityDashboard tasks={tasks} />
                <div className="mt-6">
                    <TaskFilters 
                        status={statusFilter}
                        onStatusChange={(status) => { setStatusFilter(status); setShowOnlyOverdue(false); }}
                        priority={priorityFilter}
                        onPriorityChange={(priority) => { setPriorityFilter(priority); setShowOnlyOverdue(false); }}
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
                        onAddToCalendar={handleAddToCalendar}
                    />
                </div>
            </main>
        </div>
      </div>
      <AlertDialog open={!!dueTask} onOpenChange={(open) => !open && setDueTask(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" />
                    Task Due: {dueTask?.title}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {dueTask?.description || "This task is now due."}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDueTask(null)}>Got it</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>
  );
}
    

    
