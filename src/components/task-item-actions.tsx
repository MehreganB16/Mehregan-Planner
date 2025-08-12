
'use client';

import * as React from 'react';
import { MoreHorizontal, Edit, Plus, CalendarPlus, Trash2, XCircle } from 'lucide-react';

import type { Task, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTaskDialog } from './add-task-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { CancelTaskDialog } from './cancel-task-dialog';

interface TaskItemActionsProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id' | 'status' | 'parentId' | 'createdAt'>[]) => void;
  onDelete: (id: string) => void;
  onAddToCalendar: (task: Task) => void;
  onSetStatus: (taskId: string, status: TaskStatus, cancellationNote?: string) => void;
}

export function TaskItemActions({ task, onUpdate, onAddSubTasks, onDelete, onAddToCalendar, onSetStatus }: TaskItemActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState<'edit' | 'subtask' | 'cancel' | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = React.useState(false);

  const handleAddSubtask = (data: Omit<Task, 'id'|'status'|'createdAt'>) => {
    onAddSubTasks(task.id, [data]);
  };

  const handleCancelTask = (note: string) => {
    onSetStatus(task.id, 'canceled', note);
    setDialogOpen(null);
  }

  return (
    <>
      <div className="flex items-center space-x-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDialogOpen('edit')}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Task</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDialogOpen('subtask')}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add Sub-task</span>
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => setDialogOpen('cancel')} disabled={task.status === 'canceled'}>
              <XCircle className="mr-2 h-4 w-4" />
              <span>Cancel Task</span>
            </DropdownMenuItem>
            {task.dueDate && (
              <DropdownMenuItem onSelect={() => onAddToCalendar(task)}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                <span>Add to Calendar</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Task</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Task Dialog */}
      <AddTaskDialog
        onTaskSave={() => {}} // This won't be called in edit mode
        onTaskUpdate={onUpdate}
        task={task}
        isEditing
        open={dialogOpen === 'edit'}
        onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}
      >
        {/* The trigger is now handled by the menu, so no children are needed here */}
      </AddTaskDialog>

      {/* Add Sub-task Dialog */}
      <AddTaskDialog
        onTaskSave={handleAddSubtask}
        parentId={task.id}
        open={dialogOpen === 'subtask'}
        onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}
      >
         {/* The trigger is now handled by the menu, so no children are needed here */}
      </AddTaskDialog>

      {/* Cancel Task Dialog */}
       <CancelTaskDialog 
        open={dialogOpen === 'cancel'}
        onOpenChange={(isOpen) => !isOpen && setDialogOpen(null)}
        onCancelTask={handleCancelTask}
        taskTitle={task.title}
       />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task and any associated sub-tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onDelete(task.id)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    