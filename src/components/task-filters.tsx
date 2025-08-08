
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskFiltersProps {
  status: 'all' | 'active' | 'completed';
  onStatusChange: (status: 'all' | 'active' | 'completed') => void;
}

export function TaskFilters({ status, onStatusChange }: TaskFiltersProps) {
  return (
    <Card>
        <CardContent className="p-4 flex flex-col items-start gap-4">
            <div className="w-full">
                <Tabs value={status} onValueChange={(value) => onStatusChange(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Tasks</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardContent>
    </Card>
  );
}
