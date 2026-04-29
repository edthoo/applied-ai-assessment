# Task Dependency Tracker

A simplified workflow task dependency tracker built for the [Applied AI / Opus](https://applied-ai.com/) frontend assessment. Users complete tasks in sequence — locked tasks automatically unlock when their prerequisites are met.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple)

## Demo

The app renders a vertical list of workflow tasks. Each task is in one of three states:

| State | Visual | Interaction |
|-------|--------|-------------|
| **Pending** | Amber glow, "Ready" badge | Click to complete |
| **Completed** | Green accent, checkmark, "Done" badge | No interaction |
| **Locked** | Dimmed, lock icon, "Locked" badge | Disabled — shows blocking dependencies |

### The Cascade

When a task is completed, all locked tasks are re-evaluated. If every prerequisite of a locked task is now completed, it automatically transitions to **pending** (unlocked). This is the core logic of the app.

**Dependency chain in the mock data:**

```
task_1 (Extract Invoice Data) ──→ task_3 (Human Review)
                                                        ──→ task_4 (Sync to Salesforce) ──→ task_5 (Send Client Email)
task_2 (Format JSON) ──────────────────────────────────/
```

**Example flow:**
1. Click "Extract Invoice Data" → completes, "Human Review" unlocks
2. Click "Format JSON" → completes, nothing else unlocks yet (task_4 still needs task_3)
3. Click "Human Review" → completes, "Sync to Salesforce" unlocks (both prereqs met)
4. Click "Sync to Salesforce" → completes, "Send Client Email" unlocks
5. Click "Send Client Email" → all tasks complete

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Bun** | 1.x | Runtime & package manager |
| **Vite** | 8 | Dev server & bundler |
| **React** | 19 | UI framework |
| **TypeScript** | 6 | Type safety |
| **Tailwind CSS** | 4 | Utility-first styling |

No component libraries (shadcn, MUI, etc.) — raw React + Tailwind only, as required.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.x or later

### Install & Run

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview
```

The dev server runs at `http://localhost:5173` by default.

## Project Structure

```
src/
├── App.tsx          # Main app — state management, cascade logic, layout
├── TaskCard.tsx     # Task card component with status icon, badge, dependency info
├── types.ts         # Task interface and TaskStatus type
├── data.ts          # Initial task data (provided mock data)
├── index.css        # Tailwind imports, custom theme, animations
└── main.tsx         # React entry point
```

Intentionally flat — this is a single-page, 5-task app. No over-engineered folder structure.

## Architecture Decisions

### State Management

A single `useState<Task[]>` holds all task state. No external state library — `useState` is sufficient for 5 tasks with one mutation (complete). State transitions are one-directional: `locked → pending → completed`.

### Cascade Logic

The `evaluateLocks` function runs after every completion:

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

A single pass is sufficient because the cascade only transitions `locked → pending`, never `locked → completed`. No chain reaction beyond one level of unlocking per click.

### Animations

CSS-only transitions and keyframe animations — no animation libraries:
- **Unlock**: opacity + scale transition when a task goes from locked → pending
- **Complete**: brief scale pulse on completion
- **Hover**: lift + glow intensification on pending cards

### Dependency Visibility

Locked (and completed) tasks show their prerequisites with status indicators:
- ✓ with strikethrough for completed prerequisites
- Dot for still-pending prerequisites

This gives users immediate context on what's blocking a task without scanning the full list.

### Accessibility

- Task cards use `<button>` elements with descriptive `aria-label` attributes
- Locked tasks are `disabled` — not just visually dimmed
- Color is not the sole indicator of state — icons and text badges provide redundant signals

## Design

Dark theme (slate-950 background) with amber accents for pending/actionable states and emerald for completed states. Typography uses [DM Sans](https://fonts.google.com/specimen/DM+Sans) for body text, [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) for display/headings, and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for badges and counters.

## What I'd Add in Production

- **Tests**: Vitest + React Testing Library for the cascade logic and component interactions
- **Reset button**: Allow users to reset all tasks to initial state
- **Undo**: Allow reverting the last completion (with reverse cascade)
- **Persistence**: Save task state to localStorage
- **Keyboard navigation**: Tab through pending tasks, Enter/Space to complete
- **Drag-and-drop reordering**: Let users customize task display order
