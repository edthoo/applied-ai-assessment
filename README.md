# Task Dependency Tracker

A workflow task dependency tracker I built for the [Applied AI / Opus](https://applied-ai.com/) frontend assessment. The idea's simple: you've got tasks, some depend on others, and you click through them in order. Locked tasks unlock automatically once their prerequisites are done.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple)

## How It Works

You get a vertical list of five workflow tasks. Each one sits in one of three states:

| State | What it looks like | What you can do |
|-------|-------------------|-----------------|
| **Pending** | Amber glow, "Ready" badge | Click it to mark as done |
| **Completed** | Green accent, checkmark, "Done" badge | Nothing — it's finished |
| **Locked** | Dimmed out, lock icon, "Locked" badge | Can't touch it yet — shows what's blocking it |

### The Cascade (the interesting bit)

When you complete a task, the app re-checks every locked task: "Hey, are all your prerequisites done now?" If yes, it flips to pending. That's really the core of the whole thing.

Here's the dependency chain:

```
task_1 (Extract Invoice Data) ──→ task_3 (Human Review)
                                                        ──→ task_4 (Sync to Salesforce) ──→ task_5 (Send Client Email)
task_2 (Format JSON) ──────────────────────────────────/
```

So a typical run looks like:
1. Click "Extract Invoice Data" → done, "Human Review" unlocks
2. Click "Format JSON" → done, but nothing else unlocks yet (task_4 still needs task_3)
3. Click "Human Review" → done, now "Sync to Salesforce" unlocks since both its deps are met
4. Click "Sync to Salesforce" → "Send Client Email" unlocks
5. Click that last one → you're done 🎉

## Tech Stack

| Tool | Version | Why |
|------|---------|-----|
| **Bun** | 1.x | Fast runtime, nice package manager |
| **Vite** | 8 | Dev server + bundler, basically zero config |
| **React** | 19 | UI framework |
| **TypeScript** | 6 | Keeps things honest |
| **Tailwind CSS** | 4 | Styling without the ceremony |

No component libraries — no shadcn, no MUI, nothing. Raw React + Tailwind, as the brief asked for.

## Getting Started

You'll need [Bun](https://bun.sh/) v1.x or later.

```bash
bun install
bun dev
```

That's it. Dev server runs at `http://localhost:5173`.

To build for production: `bun run build`. To preview the build: `bun run preview`.

## Project Structure

```
src/
├── App.tsx          # State management, cascade logic, layout
├── TaskCard.tsx     # Individual task card — icon, badge, dependency info
├── types.ts         # Task interface and status type
├── data.ts          # The five initial tasks
├── index.css        # Tailwind config, custom theme
└── main.tsx         # Entry point
```

I kept it flat on purpose. It's a single-page app with five tasks — spinning up a `features/` folder with barrel exports would be silly here.

## Decisions I Made (and Why)

### State

One `useState<Task[]>`. That's it. I considered whether this needed something heavier — Zustand, useReducer, but honestly, it's five items with a single mutation. `useState` does the job without any fuss.

State only flows one way: `locked → pending → completed`. No going back.

### The Cascade Function

```ts
function evaluateLocks(tasks: Task[]): Task[] {
  const completedIds = new Set(tasks.filter(t => t.status === 'completed').map(t => t.id));
  return tasks.map(task => {
    if (task.status !== 'locked') return task;
    const allMet = task.requires.every(id => completedIds.has(id));
    return allMet ? { ...task, status: 'pending' } : task;
  });
}
```

One thing I thought about: does this need to loop until nothing changes? Nope. The cascade only ever flips `locked → pending`, never straight to `completed`. So there's no chain reaction, a single pass after each click is enough.

### Visual Cues

I wanted each state to be immediately obvious without reading labels:
- **Pending** cards have an amber glow and a hover lift — they're saying "click me"
- **Completed** cards shift to green with a checkmark — clearly done
- **Locked** cards are dimmed to 50% with a lock icon and `cursor-not-allowed` — don't even try

### Showing Dependencies

Locked tasks display what they're waiting on, with status indicators for each prerequisite (✓ strikethrough if it's done, dot if it's not). I think this is important without it, you'd have to scan the whole list to figure out why something's locked.

### Accessibility

Task cards are actual `<button>` elements with `aria-label` attributes. Locked tasks are properly `disabled`, not just styled to look that way. And I made sure colour isn't the only way to tell states apart — there are icons and text badges too.

## Design

Dark theme with a slate-950 background. Amber for anything actionable, emerald for completed. Typography-wise, I went with [DM Sans](https://fonts.google.com/specimen/DM+Sans) for body text, [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) for headings, and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for the badges and counters.
