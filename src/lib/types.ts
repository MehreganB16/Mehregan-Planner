export type Priority = "high" | "medium" | "low" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | undefined;
  priority: Priority;
  completed: boolean;
  parentId?: string;
  completionDate?: Date;
  createdAt: Date;
  userId: string;
}
