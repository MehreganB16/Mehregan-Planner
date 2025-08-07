'use client';

import * as React from 'react';
import type { Task } from '@/lib/types';
import { TaskItem } from '@/components/task-item';
import { Card, CardHeader, CardTitle } from './ui/card';
import { ListTodo } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[]; // We need all tasks to find children
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => void;
}

export function TaskList({ tasks, allTasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask, onAddSubTasks }: TaskListProps) {
    const parentTasks = tasks.filter(task => !task.parentId);

    const getSubtasks = (parentId: string) => {
        return allTasks.filter(task => task.parentId === parentId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
    };

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader className="flex-row items-center gap-4">
            <div className="flex-shrink-0">
                <ListTodo className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
                <CardTitle>No tasks here!</CardTitle>
                <p className="text-muted-foreground">Add a new task to get started or adjust your filters.</p>
            </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full grid gap-4">
      {parentTasks.map(task => {
        const subtasks = getSubtasks(task.id);
        if (subtasks.length > 0) {
            return (
                <Accordion type="single" collapsible key={task.id} className="w-full" defaultValue='item-1'>
                    <AccordionItem value="item-1" className="border-none">
                        <div className="flex items-center">
                            <TaskItem
                                task={task}
                                subtasks={subtasks}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                                onUpdate={onUpdateTask}
                                onAddTask={onAddTask}
                                onAddSubTasks={onAddSubTasks}
                            />
                            <AccordionTrigger className="p-2"/>
                        </div>
                        <AccordionContent className="pl-8 pt-2 grid gap-2 relative">
                             <div className="absolute left-4 top-0 bottom-0 w-px bg-border -translate-x-px"></div>
                            {subtasks.map(subtask => (
                                <TaskItem
                                    key={subtask.id}
                                    task={subtask}
                                    subtasks={[]} // sub-tasks dont have sub-tasks
                                    onToggle={onToggleTask}
                                    onDelete={onDeleteTask}
                                    onUpdate={onUpdateTask}
                                    onAddTask={onAddTask}
                                    onAddSubTasks={onAddSubTasks}
                                    isSubtask
                                />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )
        }
        return (
            <TaskItem
                key={task.id}
                task={task}
                subtasks={[]}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                onAddTask={onAddTask}
                onAddSubTasks={onAddSubTasks}
            />
        )
      })}
    </div>
  );
}
