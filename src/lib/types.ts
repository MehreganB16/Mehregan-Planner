export type Priority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  completed: boolean;
  parentId?: string;
  completionDate?: Date;
  createdAt: Date;
  dueTime?: string;
};
