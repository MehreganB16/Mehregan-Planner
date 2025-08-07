'use client';

import type { Priority } from '@/lib/types';
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
}

export function TaskFilters({ status, onStatusChange, priority, onPriorityChange }: TaskFiltersProps) {
  return (
    <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Tabs value={status} onValueChange={(value) => onStatusChange(value as any)}>
                <TabsList>
                    <TabsTrigger value="all">All Tasks</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label htmlFor="priority-filter" className="flex-shrink-0">Filter by Priority:</Label>
                <Select value={priority} onValueChange={(value) => onPriorityChange(value as any)}>
                    <SelectTrigger id="priority-filter" className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
    </Card>
  );
}
