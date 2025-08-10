import { MoreVertical, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Task } from '@/lib/types';
import { AddTaskDialog } from './add-task-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import React from 'react';

interface TaskItemActionsProps {
  task: Task;
  onAddSubTasks: (parentId: string, subTasks: Omit<Task, 'id' | 'completed' | 'parentId' | 'createdAt'>[]) => void;
}

export function TaskItemActions({ task, onAddSubTasks }: TaskItemActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddSubtask = (data: Omit<Task, 'id'|'completed'|'createdAt'>) => {
    onAddSubTasks(task.id, [data]);
    setIsDialogOpen(false); // Close dialog on save
  }

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>More Actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
          <AddTaskDialog 
            parentId={task.id} 
            onTaskSave={handleAddSubtask}
            isEditing={false}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Sub-task</span>
            </DropdownMenuItem>
          </AddTaskDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    