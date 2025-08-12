export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = 'active' | 'completed' | 'canceled';

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: TaskStatus;
  parentId?: string;
  completionDate?: Date;
  cancellationNote?: string;
  createdAt: Date;
  dueTime?: string;
};

    