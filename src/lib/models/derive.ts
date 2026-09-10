import type { FileBacked, Goal, Project } from './types';

/** First project whose goals[] contains the given goal title, or null. */
export function projectForGoal<P extends Project>(projects: P[], goalTitle: string): P | null {
  return projects.find((p) => p.goals.includes(goalTitle)) ?? null;
}

export type ProjectGroup<P, G> = { project: P | null; goals: G[] };

/**
 * Goals grouped by their project, in project order, followed by a trailing
 * `{ project: null }` bucket for goals not referenced by any project (e.g. after
 * their project was deleted).
 */
export function goalsByProject<P extends Project, G extends Goal>(
  projects: P[],
  goals: G[],
): ProjectGroup<P, G>[] {
  const byTitle = new Map(goals.map((g) => [g.title, g]));
  const claimed = new Set<string>();
  const groups: ProjectGroup<P, G>[] = [];

  for (const project of projects) {
    const list: G[] = [];
    for (const title of project.goals) {
      const g = byTitle.get(title);
      if (g && !claimed.has(title)) {
        claimed.add(title);
        list.push(g);
      }
    }
    groups.push({ project, goals: list });
  }

  const orphans = goals.filter((g) => !claimed.has(g.title));
  if (orphans.length) groups.push({ project: null, goals: orphans });

  return groups;
}

export type AutocompleteEntry = { label: string; goal: string };

/** One entry per goal, labelled "Project: Goal" (bare goal title if orphaned). */
export function autocompleteEntries(
  projects: Project[],
  goals: Goal[],
): AutocompleteEntry[] {
  const projectByGoal = new Map<string, string>();
  for (const p of projects) {
    for (const t of p.goals) if (!projectByGoal.has(t)) projectByGoal.set(t, p.title);
  }
  return goals.map((g) => {
    const proj = projectByGoal.get(g.title);
    return { label: proj ? `${proj}: ${g.title}` : g.title, goal: g.title };
  });
}

export function stripFile<T>(model: FileBacked<T>): T {
  const { __file, ...rest } = model as FileBacked<T> & Record<string, unknown>;
  void __file;
  return rest as T;
}
