'use client';

import * as React from 'react';
import { PieChart, CheckCircle2, ListTodo } from 'lucide-react';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';

import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5"/>
                    Task Status
                </CardTitle>
                <CardDescription>A breakdown of your active and completed tasks.</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square h-[200px]"
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
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={theme === 'dark' ? '#000' : '#fff'} />
                    ))}
                  </Pie>
                  <Legend />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
    );
}
