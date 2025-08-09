"use client";

import * as React from 'react';
import type { Task, Priority } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Download, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { add, sub, startOfToday } from 'date-fns';

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
        dueDate: add(new Date(), { days: 2 }),
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

const SidebarContent = ({ onTaskSave, onExport, onImport }: { 
    onTaskSave: (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void 
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
      </div>
      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs text-muted-foreground">&copy; 2024 Mehregan</p>
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

  const handleAddTask = (data: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...data,
      id: uuidv4(),
      completed: false,
      createdAt: new Date(),
    };
    setTasks(prev => (prev ? [...prev, newTask] : [newTask]));
    toast({
      title: 'Task Added!',
      description: `"${newTask.title}" has been successfully added.`,
    });
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

  const sidebar = <SidebarContent onTaskSave={handleAddTask} onExport={handleExportTasks} onImport={handleImportTasks} />;

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
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                        <p className="text-muted-foreground">Here is your organized task list.</p>
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
