'use client';

import * as React from 'react';
import type { Task } from '@/lib/types';
import { TaskItem } from '@/components/task-item';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ListTodo } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[]; // We need all tasks to find children
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export function TaskList({ tasks, allTasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask }: TaskListProps) {
    const parentTasks = tasks.filter(task => !task.parentId);

    const getSubtasks = (parentId: string) => {
        return allTasks.filter(task => task.parentId === parentId);
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
    <Accordion type="multiple" className="w-full grid gap-4">
      {parentTasks.map(task => {
        const subtasks = getSubtasks(task.id);
        if (subtasks.length > 0) {
            return (
                <AccordionItem value={task.id} key={task.id} className="border-none">
                    <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>div>button[aria-label=Edit]]:-rotate-90">
                         <TaskItem
                            task={task}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                            onUpdate={onUpdateTask}
                            onAddTask={onAddTask}
                        />
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pt-2 grid gap-2">
                        {subtasks.map(subtask => (
                            <TaskItem
                                key={subtask.id}
                                task={subtask}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                                onUpdate={onUpdateTask}
                                onAddTask={onAddTask}
                                isSubtask
                            />
                        ))}
                    </AccordionContent>
                </AccordionItem>
            )
        }
        return (
            <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                onAddTask={onAddTask}
            />
        )
      })}
    </Accordion>
  );
}
