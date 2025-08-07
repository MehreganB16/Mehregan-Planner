export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date | undefined;
  priority: Priority;
  completed: boolean;
}
