import { ChevronsUpDown, Filter } from 'lucide-react';

import type { SortOption } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Priority } from '@/lib/types';

interface TaskFiltersProps {
  status: 'all' | 'active' | 'completed';
  onStatusChange: (status: 'all' | 'active' | 'completed') => void;
  priority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'createdAt', label: 'Added Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'completionDate', label: 'Completed Date' },
  ];

const priorityOptions: { value: Priority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

export function TaskFilters({ status, onStatusChange, priority, onPriorityChange, sortOption, onSortChange }: TaskFiltersProps) {
  const selectedSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label;
  const selectedPriorityLabel = priorityOptions.find(opt => opt.value === priority)?.label;

  return (
    <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="w-full sm:w-auto flex-grow">
                <Tabs value={status} onValueChange={(value) => onStatusChange(value as any)}>
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Done</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-4 flex-wrap">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex-1 sm:w-[180px] justify-between">
                        {selectedPriorityLabel}
                        <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={priority} onValueChange={(val) => onPriorityChange(val as Priority | 'all')}>
                        {priorityOptions.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>{option.label}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full flex-1 sm:w-[180px] justify-between">
                        Sort by: {selectedSortLabel}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuLabel>Sort Tasks By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={(val) => onSortChange(val as SortOption)}>
                        {sortOptions.map(option => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>{option.label}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardContent>
    </Card>
  );
}

    