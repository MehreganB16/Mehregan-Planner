export type Task = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  duration: number; // in minutes
  priority: 'high' | 'medium' | 'low';
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
};

export type Constraint = {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
};
