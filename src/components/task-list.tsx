import * as React from 'react';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskItem } from '@/components/task-item';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ListTodo } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[]; // We need all tasks to find children
  onSetTaskStatus: (id: string, status: TaskStatus, cancellationNote?: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'status' | 'parentId' | 'createdAt'>[]) => void;
  onAddToCalendar: (task: Task) => void;
}

const RecursiveTaskList: React.FC<Omit<TaskListProps, 'onAddTask'>> = ({ tasks, allTasks, onSetTaskStatus, onDeleteTask, onUpdateTask, onAddSubTasks, onAddToCalendar }) => {
    const getSubtasks = (parentId: string) => {
        return allTasks.filter(task => task.parentId === parentId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
    };

    return (
         <div className="w-full grid gap-2">
            {tasks.map(task => {
                const subtasks = getSubtasks(task.id);

                if (subtasks.length > 0) {
                    return (
                        <Accordion type="single" collapsible key={task.id} className="w-full">
                            <AccordionItem value={task.id} className="border-none">
                                <TaskItem
                                    task={task}
                                    subtasks={subtasks}
                                    onSetStatus={onSetTaskStatus}
                                    onDelete={onDeleteTask}
                                    onUpdate={onUpdateTask}
                                    onAddSubTasks={onAddSubTasks}
                                    onAddToCalendar={onAddToCalendar}
                                    accordionTrigger={<AccordionTrigger className="p-0 mt-1" />}
                                />
                                <AccordionContent className="pl-6 pt-2 grid gap-2 relative before:absolute before:left-2 before:top-0 before:h-full before:w-px before:bg-border">
                                     <RecursiveTaskList
                                        tasks={subtasks}
                                        allTasks={allTasks}
                                        onSetTaskStatus={onSetTaskStatus}
                                        onDeleteTask={onDeleteTask}
                                        onUpdateTask={onUpdateTask}
                                        onAddSubTasks={onAddSubTasks}
                                        onAddToCalendar={onAddToCalendar}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )
                }
                return (
                    <div key={task.id} className="flex items-start w-full">
                        <TaskItem
                            task={task}
                            subtasks={[]}
                            onSetStatus={onSetTaskStatus}
                            onDelete={onDeleteTask}
                            onUpdate={onUpdateTask}
                            onAddSubTasks={onAddSubTasks}
                            onAddToCalendar={onAddToCalendar}
                        />
                    </div>
                )
            })}
         </div>
    )
}

export function TaskList(props: TaskListProps) {
    const parentTasks = props.tasks.filter(task => !task.parentId);

  if (props.tasks.length === 0) {
    return (
      <Card className="border-dashed shadow-none flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full border border-dashed p-4">
            <ListTodo className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardHeader className="p-4 pb-2">
            <CardTitle as="h2" className="text-xl">No tasks here!</CardTitle>
        </CardHeader>
        <CardDescription>Add a new task or adjust your filters to see your to-dos.</CardDescription>
      </Card>
    );
  }

  return (
    <RecursiveTaskList 
        {...props}
        tasks={parentTasks}
    />
  );
}

    