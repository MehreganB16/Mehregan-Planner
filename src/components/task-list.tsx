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
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id'| 'completed' | 'parentId' | 'createdAt'>[]) => void;
  onAddToCalendar: (task: Task) => void;
}

const RecursiveTaskList: React.FC<Omit<TaskListProps, 'onAddTask'>> = ({ tasks, allTasks, onToggleTask, onDeleteTask, onUpdateTask, onAddSubTasks, onAddToCalendar }) => {
    const getSubtasks = (parentId: string) => {
        return allTasks.filter(task => task.parentId === parentId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
    };

    return (
         <div className="w-full grid gap-4">
            {tasks.map(task => {
                const subtasks = getSubtasks(task.id);
                if (subtasks.length > 0) {
                    return (
                        <Accordion type="single" collapsible key={task.id} className="w-full">
                            <AccordionItem value={task.id} className="border-none">
                                <TaskItem
                                    task={task}
                                    subtasks={subtasks}
                                    onToggle={onToggleTask}
                                    onDelete={onDeleteTask}
                                    onUpdate={onUpdateTask}
                                    onAddSubTasks={onAddSubTasks}
                                    onAddToCalendar={onAddToCalendar}
                                    accordionTrigger={<AccordionTrigger className="p-0 mt-1" />}
                                />
                                <AccordionContent className="pl-4 pt-2 grid gap-2 relative">
                                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border -translate-x-px"></div>
                                     <RecursiveTaskList
                                        tasks={subtasks}
                                        allTasks={allTasks}
                                        onToggleTask={onToggleTask}
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
                            onToggle={onToggleTask}
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
      <Card className="border-dashed shadow-none">
        <CardHeader className="flex-row items-center gap-4">
            <div className="flex-shrink-0">
                <ListTodo className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
                <CardTitle as="h2" className="text-xl">No tasks here!</CardTitle>
                <p className="text-muted-foreground">Add a new task to get started or adjust your filters.</p>
            </div>
        </CardHeader>
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
