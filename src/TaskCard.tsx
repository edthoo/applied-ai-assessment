import type { Task } from './types';

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  onComplete: (id: string) => void;
}

function StatusIcon({ status }: { status: Task['status'] }) {
  if (status === 'completed') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-emerald/15">
        <svg className="h-4 w-4 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-accent-amber/40 bg-accent-amber/10">
        <div className="h-2 w-2 rounded-full bg-accent-amber" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-700/60">
      <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: Task['status'] }) {
  const config = {
    pending: { label: 'Ready', className: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' },
    completed: { label: 'Done', className: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' },
    locked: { label: 'Locked', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  } as const;

  const { label, className } = config[status];

  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function DependencyInfo({ task, allTasks }: { task: Task; allTasks: Task[] }) {
  if (task.requires.length === 0) return null;

  const taskMap = new Map(allTasks.map((t) => [t.id, t]));

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500">
      <span>Depends on:</span>
      {task.requires.map((reqId, i) => {
        const req = taskMap.get(reqId);
        if (!req) return null;
        const done = req.status === 'completed';
        return (
          <span key={reqId} className="inline-flex items-center gap-1">
            {done ? (
              <svg className="h-3 w-3 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-600" />
            )}
            <span className={done ? 'text-slate-600 line-through' : 'text-slate-400'}>
              {req.title}
            </span>
            {i < task.requires.length - 1 && <span className="text-slate-700">·</span>}
          </span>
        );
      })}
    </div>
  );
}

export function TaskCard({ task, allTasks, onComplete }: TaskCardProps) {
  const isPending = task.status === 'pending';
  const isLocked = task.status === 'locked';

  return (
    <button
      type="button"
      disabled={!isPending}
      onClick={() => isPending && onComplete(task.id)}
      className={`
        w-full rounded-xl p-4 text-left transition-all
        ${task.status === 'pending' ? 'card-pending cursor-pointer bg-surface-900' : ''}
        ${task.status === 'completed' ? 'card-completed bg-surface-900/70' : ''}
        ${task.status === 'locked' ? 'card-locked cursor-not-allowed bg-surface-900/40 opacity-50' : ''}
      `}
      aria-label={
        isPending
          ? `Mark "${task.title}" as completed`
          : isLocked
            ? `"${task.title}" is locked`
            : `"${task.title}" is completed`
      }
    >
      <div className="flex items-center gap-3">
        <StatusIcon status={task.status} />
        <span
          className={`
            flex-1 font-display text-sm font-semibold tracking-tight
            ${task.status === 'completed' ? 'text-slate-400' : ''}
            ${task.status === 'locked' ? 'text-slate-500' : ''}
          `}
        >
          {task.title}
        </span>
        <StatusBadge status={task.status} />
      </div>
      {(isLocked || task.status === 'completed') && task.requires.length > 0 && (
        <div className="ml-11">
          <DependencyInfo task={task} allTasks={allTasks} />
        </div>
      )}
    </button>
  );
}
