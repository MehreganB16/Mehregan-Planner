import * as React from 'react';
import { PieChart, CheckCircle2, ListTodo } from 'lucide-react';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';

import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useTheme } from 'next-themes';

interface ProductivityDashboardProps {
  tasks: Task[];
}

export function ProductivityDashboard({ tasks }: ProductivityDashboardProps) {
    const { theme } = useTheme();

    const statusData = React.useMemo(() => {
        const completed = tasks.filter(t => t.completed).length;
        const active = tasks.length - completed;
        return [
            { name: 'Active', value: active, fill: 'hsl(var(--chart-2))' },
            { name: 'Completed', value: completed, fill: 'hsl(var(--chart-1))' },
        ];
    }, [tasks]);
    
    const priorityData = React.useMemo(() => {
        const priorities = tasks.reduce((acc, task) => {
            if (!task.completed) {
                acc[task.priority] = (acc[task.priority] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'Urgent', value: priorities.urgent || 0, fill: 'hsl(var(--destructive))' },
            { name: 'High', value: priorities.high || 0, fill: 'hsl(var(--accent))' },
            { name: 'Medium', value: priorities.medium || 0, fill: 'hsl(var(--primary))' },
            { name: 'Low', value: priorities.low || 0, fill: 'hsl(var(--success))' },
        ].filter(item => item.value > 0);
    }, [tasks]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
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
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5"/>
                    Task Status
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square h-[160px]"
              >
                <RechartsPieChart>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    strokeWidth={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={theme === 'dark' ? '#000' : '#fff'} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5"/>
                    Active Priorities
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square h-[160px]"
              >
                <RechartsPieChart>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    strokeWidth={5}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={theme === 'dark' ? '#000' : '#fff'} />
                    ))}
                  </Pie>
                   <Legend iconSize={10} />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
    );
}
