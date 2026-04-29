import type { Task } from './types';

export const initialTasks: Task[] = [
  { id: 'task_1', title: 'Extract Invoice Data (AI)', status: 'pending', requires: [] },
  { id: 'task_2', title: 'Format JSON', status: 'pending', requires: [] },
  { id: 'task_3', title: 'Human Review', status: 'locked', requires: ['task_1'] },
  { id: 'task_4', title: 'Sync to Salesforce', status: 'locked', requires: ['task_2', 'task_3'] },
  { id: 'task_5', title: 'Send Client Email', status: 'locked', requires: ['task_4'] },
];
