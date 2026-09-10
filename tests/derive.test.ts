import assert from 'node:assert/strict';
import { test } from 'node:test';

import { autocompleteEntries, goalsByProject, projectForGoal } from '../src/lib/models/derive';
import type { Goal, Project } from '../src/lib/models/types';

const projects: Project[] = [
  { title: 'Site', goals: ['Ship landing page', 'Write copy'] },
  { title: 'Health', goals: ['Run 5k'] },
];

const goals: Goal[] = [
  { title: 'Ship landing page', created: '2026-01-01T00:00:00Z', fulfilled: false },
  { title: 'Write copy', created: '2026-01-02T00:00:00Z', fulfilled: true },
  { title: 'Run 5k', created: '2026-01-03T00:00:00Z', fulfilled: false },
  { title: 'Orphan goal', created: '2026-01-04T00:00:00Z', fulfilled: false },
];

test('projectForGoal finds the owning project', () => {
  assert.equal(projectForGoal(projects, 'Run 5k')?.title, 'Health');
  assert.equal(projectForGoal(projects, 'Nope'), null);
});

test('goalsByProject groups and appends an orphan bucket', () => {
  const groups = goalsByProject(projects, goals);
  assert.equal(groups.length, 3);
  assert.equal(groups[0].project?.title, 'Site');
  assert.deepEqual(groups[0].goals.map((g) => g.title), ['Ship landing page', 'Write copy']);
  assert.equal(groups[2].project, null);
  assert.deepEqual(groups[2].goals.map((g) => g.title), ['Orphan goal']);
});

test('autocompleteEntries labels "Project: Goal", bare for orphans', () => {
  const entries = autocompleteEntries(projects, goals);
  assert.deepEqual(
    entries.find((e) => e.goal === 'Run 5k'),
    { label: 'Health: Run 5k', goal: 'Run 5k' },
  );
  assert.deepEqual(
    entries.find((e) => e.goal === 'Orphan goal'),
    { label: 'Orphan goal', goal: 'Orphan goal' },
  );
});
