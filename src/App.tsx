import { useState, useRef } from 'react';
import type { Task } from './types';
import { initialTasks } from './data';
import { TaskCard } from './TaskCard';

function evaluateLocks(tasks: Task[]): Task[] {
  const completedIds = new Set(tasks.filter((t) => t.status === 'completed').map((t) => t.id));
  return tasks.map((task) => {
    if (task.status !== 'locked') return task;
    const allMet = task.requires.every((id) => completedIds.has(id));
    return allMet ? { ...task, status: 'pending' as const } : task;
  });
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [animations, setAnimations] = useState<Record<string, string>>({});
  const prevTasksRef = useRef<Task[]>(initialTasks);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const allDone = completedCount === tasks.length;
  const progress = (completedCount / tasks.length) * 100;

  function completeTask(id: string) {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status: 'completed' as const } : t));
      const evaluated = evaluateLocks(updated);

      // Determine which tasks just unlocked or just completed
      const newAnimations: Record<string, string> = {};
      newAnimations[id] = 'animate-complete';
      for (const task of evaluated) {
        const prevTask = prevTasksRef.current.find((t) => t.id === task.id);
        if (prevTask?.status === 'locked' && task.status === 'pending') {
          newAnimations[task.id] = 'animate-unlock';
        }
      }
      prevTasksRef.current = evaluated;
      setAnimations(newAnimations);
      setTimeout(() => setAnimations({}), 600);

      return evaluated;
    });
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Task Dependency Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Complete tasks to unlock the next steps in the workflow.
          </p>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-800">
              <div
                className="animate-fill h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-emerald transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs text-slate-500">
              {completedCount}/{tasks.length}
            </span>
          </div>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              allTasks={tasks}
              onComplete={completeTask}
              animationClass={animations[task.id]}
            />
          ))}
        </div>

        {/* Completion message */}
        {allDone && (
          <div className="mt-6 rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4 text-center">
            <p className="font-display text-sm font-semibold text-accent-emerald">
              ✓ All tasks completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
