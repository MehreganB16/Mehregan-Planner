
import * as React from 'react';
import { PieChart, CheckCircle2, ListTodo, AlertTriangle, Calendar, ChevronsUpDown, XCircle } from 'lucide-react';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { format, isPast } from 'date-fns';
import Autoplay from "embla-carousel-autoplay"

import type { Priority, Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { Badge } from './ui/badge';
  

interface ProductivityDashboardProps {
  tasks: Task[];
  onChartClick?: (payload: any) => void;
}

const priorityBadgeConfig: Record<Priority, { label: string; color: string; icon: React.ElementType }> = {
    urgent: { label: 'Urgent', color: 'border-transparent bg-red-500 text-red-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/80', icon: AlertTriangle },
    high: { label: 'High', color: 'border-transparent bg-orange-500 text-orange-50 hover:bg-orange-500/80 dark:bg-orange-800 dark:text-orange-50 dark:hover:bg-orange-800/80', icon: ChevronsUpDown },
    medium: { label: 'Medium', color: 'border-transparent bg-blue-500 text-blue-50 hover:bg-blue-500/80 dark:bg-blue-800 dark:text-blue-50 dark:hover:bg-blue-800/80', icon: ChevronsUpDown },
    low: { label: 'Low', color: 'border-transparent bg-green-500 text-green-50 hover:bg-green-500/80 dark:bg-green-800 dark:text-green-50 dark:hover:bg-green-800/80', icon: ChevronsUpDown },
};


const StatusChart = ({ data, onClick }: { data: any[], onClick: (payload: any) => void }) => {
     if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center h-[120px]">
                <CardDescription className="text-xs">No tasks with statuses.</CardDescription>
            </div>
        );
    }
    return (
    <ChartContainer config={{}} className="mx-auto aspect-square h-[120px]">
      <RechartsPieChart>
        <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={30} onClick={onClick} className="cursor-pointer" stroke="hsl(var(--card))" strokeWidth={2}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
          ))}
        </Pie>
        <Legend iconSize={10} verticalAlign="bottom" />
      </RechartsPieChart>
    </ChartContainer>
    );
};

const PriorityChart = ({ data, onClick }: { data: any[], onClick: (payload: any) => void }) => {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center h-[120px]">
                <CardDescription className="text-xs">No active tasks with priorities.</CardDescription>
            </div>
        );
    }
    return (
        <ChartContainer config={{}} className="mx-auto aspect-square h-[120px]">
            <RechartsPieChart>
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={30} onClick={onClick} className="cursor-pointer" stroke="hsl(var(--card))" strokeWidth={2}>
                {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
            </Pie>
            <Legend iconSize={10} verticalAlign="bottom" />
            </RechartsPieChart>
        </ChartContainer>
    );
};

export function ProductivityDashboard({ tasks, onChartClick }: ProductivityDashboardProps) {
    const statusData = React.useMemo(() => {
        const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'Active', value: statusCounts.active || 0, fill: 'hsl(var(--chart-2))' },
            { name: 'Completed', value: statusCounts.completed || 0, fill: 'hsl(var(--success))' },
            { name: 'Canceled', value: statusCounts.canceled || 0, fill: 'hsl(var(--muted-foreground))' },
        ].filter(item => item.value > 0);
    }, [tasks]);
    
    const priorityData = React.useMemo(() => {
        const priorities = tasks.reduce((acc, task) => {
            if (task.status === 'active') {
                acc[task.priority] = (acc[task.priority] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const priorityMap = {
            Urgent: { value: priorities.urgent || 0, fill: 'hsl(var(--destructive))' },
            High: { value: priorities.high || 0, fill: 'hsl(var(--chart-4))' },
            Medium: { value: priorities.medium || 0, fill: 'hsl(var(--chart-2))' },
            Low: { value: priorities.low || 0, fill: 'hsl(var(--chart-1))' },
        };

        return Object.entries(priorityMap)
          .map(([name, data]) => ({ name, ...data }))
          .filter(item => item.value > 0);

    }, [tasks]);
    
    const overdueTasks = React.useMemo(() => {
      if (!tasks) return [];
      return tasks.filter(task => task.dueDate && task.status === 'active' && isPast(new Date(task.dueDate)));
    }, [tasks]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    const handlePieClick = (data: any) => {
        if (onChartClick && data && data.payload) {
            onChartClick(data.payload);
        }
    };
    
    const OverdueTaskCarousel = () => {
        if (overdueTasks.length === 0) return null;

        const plugin = React.useRef(
            Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
        );

        return (
            <div 
                className="relative col-span-1 sm:col-span-2 lg:col-span-4 rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4 sm:p-6 animate-pulse cursor-pointer"
                onClick={() => onChartClick?.({ name: 'Overdue' })}
            >
                <div className="flex items-center gap-4 mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <h3 className="text-lg font-bold text-destructive">
                            {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm text-destructive/80">These tasks need your immediate attention.</p>
                    </div>
                </div>
                <Carousel
                    plugins={[plugin.current]}
                    opts={{
                        align: "start",
                        loop: overdueTasks.length > 1,
                    }}
                    className="w-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="-ml-2 sm:-ml-4">
                        {overdueTasks.map((task) => {
                            const { label, color, icon: Icon } = priorityBadgeConfig[task.priority];
                            return (
                                <CarouselItem key={task.id} className="pl-2 sm:pl-4 md:basis-1/2 lg:basis-1/3">
                                     <Card className="h-full">
                                        <CardContent className="flex flex-col gap-3 p-4">
                                            <p className="font-semibold leading-tight">{task.title}</p>
                                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-auto">
                                                {task.dueDate && (
                                                     <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{format(new Date(task.dueDate), 'MMM d, p')}</span>
                                                    </div>
                                                )}
                                                <Badge className={cn(color)} variant="secondary">
                                                    <Icon className="h-3 w-3 mr-1"/>
                                                    {label}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            )
                        })}
                    </CarouselContent>
                    {overdueTasks.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
                            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:flex" />
                        </>
                    )}
                </Carousel>
            </div>
        );
    }


    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverdueTaskCarousel />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% completed` : 'No tasks yet'}
              </p>
            </CardContent>
          </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Task Status</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                    <StatusChart data={statusData} onClick={handlePieClick} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Priorities</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex items-center justify-center p-0">
                    <PriorityChart data={priorityData} onClick={handlePieClick} />
                </CardContent>
            </Card>
        </div>
    );
}
