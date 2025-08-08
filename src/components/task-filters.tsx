
'use client';

import { ChevronsUpDown } from 'lucide-react';

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

interface TaskFiltersProps {
  status: 'all' | 'active' | 'completed';
  onStatusChange: (status: 'all' | 'active' | 'completed') => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'createdAt', label: 'Added Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'completionDate', label: 'Completed Date' },
  ];

export function TaskFilters({ status, onStatusChange, sortOption, onSortChange }: TaskFiltersProps) {
  const selectedSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label;

  return (
    <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto sm:flex-1">
                <Tabs value={status} onValueChange={(value) => onStatusChange(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Tasks</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between">
                        {selectedSortLabel}
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

    