
'use client';

import * as React from 'react';
import type { Task } from '@/lib/types';
import { TaskItem } from '@/components/task-item';
import { Card, CardHeader, CardTitle } from './ui/card';
import { ListTodo } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[]; // We need all tasks to find children
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => void;
}

interface RecursiveTaskListProps extends TaskListProps {
    isSubtask?: boolean;
    level?: number;
}


const RecursiveTaskList: React.FC<RecursiveTaskListProps> = ({ tasks, allTasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask, onAddSubTasks, isSubtask = false, level = 0 }) => {
    const getSubtasks = (parentId: string) => {
        return allTasks.filter(task => task.parentId === parentId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
    };

    return (
         <div className="w-full grid gap-4" style={{ marginLeft: isSubtask ? `${level * 1.5}rem` : '0' }}>
            {tasks.map(task => {
                const subtasks = getSubtasks(task.id);
                if (subtasks.length > 0) {
                    return (
                        <Accordion type="single" collapsible key={task.id} className="w-full" defaultValue='item-1'>
                            <AccordionItem value="item-1" className="border-none">
                                <div className="flex items-start w-full">
                                    <AccordionTrigger className="p-2 mt-4"/>
                                    <TaskItem
                                        task={task}
                                        subtasks={subtasks}
                                        onToggle={onToggleTask}
                                        onDelete={onDeleteTask}
                                        onUpdate={onUpdateTask}
                                        onAddTask={onAddTask}
                                        onAddSubTasks={onAddSubTasks}
                                        isSubtask={isSubtask}
                                    />
                                </div>
                                <AccordionContent className="pl-6 pt-2 grid gap-2 relative">
                                    <div className="absolute left-3 top-0 bottom-0 w-px bg-border -translate-x-px"></div>
                                     <RecursiveTaskList 
                                        tasks={subtasks}
                                        allTasks={allTasks}
                                        onToggleTask={onToggleTask}
                                        onDeleteTask={onDeleteTask}
                                        onUpdateTask={onUpdateTask}
                                        onAddTask={onAddTask}
                                        onAddSubTasks={onAddSubTasks}
                                        isSubtask={true}
                                        level={level + 1}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )
                }
                return (
                    <div key={task.id} className="flex items-start w-full">
                        <div className="w-8 flex-shrink-0">&nbsp;</div>
                        <TaskItem
                            task={task}
                            subtasks={[]}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                            onUpdate={onUpdateTask}
                            onAddTask={onAddTask}
                            onAddSubTasks={onAddSubTasks}
                            isSubtask={isSubtask}
                        />
                    </div>
                )
            })}
         </div>
    )
}

export function TaskList({ tasks, allTasks, onToggleTask, onDeleteTask, onUpdateTask, onAddTask, onAddSubTasks }: TaskListProps) {
    const parentTasks = tasks.filter(task => !task.parentId);

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
    <RecursiveTaskList 
        tasks={parentTasks}
        allTasks={allTasks}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onUpdateTask={onUpdateTask}
        onAddTask={onAddTask}
        onAddSubTasks={onAddSubTasks}
    />
  );
}
