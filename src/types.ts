export type TaskStatus = 'pending' | 'completed' | 'locked';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  requires: string[];
}
