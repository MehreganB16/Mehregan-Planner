
'use client';

import type { Priority } from '@/lib/types';
import type { SortOption } from '@/app/page';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskFiltersProps {
  status: 'all' | 'active' | 'completed';
  onStatusChange: (status: 'all' | 'active' | 'completed') => void;
  priority: 'all' | Priority;
  onPriorityChange: (priority: 'all' | Priority) => void;
  sortOption: SortOption;
  onSortOptionChange: (sortOption: SortOption) => void;
}

export function TaskFilters({ status, onStatusChange, priority, onPriorityChange, sortOption, onSortOptionChange }: TaskFiltersProps) {
  return (
    <Card>
        <CardContent className="p-4 flex flex-col items-start gap-4">
            <div className="w-full">
                <Tabs value={status} onValueChange={(value) => onStatusChange(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Tasks</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className='flex flex-col sm:flex-row items-center gap-4 w-full'>
                <div className="flex items-center gap-2 w-full">
                    <Label htmlFor="priority-filter" className="flex-shrink-0">Priority:</Label>
                    <Select value={priority} onValueChange={(value) => onPriorityChange(value as any)}>
                        <SelectTrigger id="priority-filter" className="w-full">
                            <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 w-full">
                    <Label htmlFor="sort-filter" className="flex-shrink-0">Sort by:</Label>
                    <Select value={sortOption} onValuegaChange={(value) => onSortOptionChange(value as any)}>
                        <SelectTrigger id="sort-filter" className="w-full">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="createdAt">Date Added</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

    