import { Task } from './types';

const KEY = 'vmas_tasks';

export function getAllTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

export function saveTask(task: Task): void {
  const all = getAllTasks();
  const idx = all.findIndex(t => t.id === task.id);
  if (idx >= 0) all[idx] = task;
  else all.push(task);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteTask(id: string): void {
  const all = getAllTasks().filter(t => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
