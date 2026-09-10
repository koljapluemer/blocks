import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Fab } from '@/components/ui/fab';
import { useToast } from '@/components/ui/toast';
import { goalsByProject } from '@/lib/models/derive';
import type { FileBacked, Goal, Project } from '@/lib/models/types';
import { useData } from '@/lib/store/StoreProvider';

import { GoalFormModal } from './GoalFormModal';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectGroup } from './ProjectGroup';

type ModalState =
  | { kind: 'none' }
  | { kind: 'project-add' }
  | { kind: 'project-edit'; project: FileBacked<Project> }
  | { kind: 'goal-add'; projectFile: string; projectTitle: string }
  | { kind: 'goal-edit'; goal: FileBacked<Goal>; projectTitle: string };

const CLOSED: ModalState = { kind: 'none' };

export function GoalsScreen() {
  const {
    projects,
    goals,
    createProject,
    updateProject,
    removeProject,
    restoreProject,
    createGoal,
    updateGoal,
    renameGoal,
    removeGoal,
    restoreGoal,
  } = useData();
  const { showUndo } = useToast();

  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [modal, setModal] = useState<ModalState>(CLOSED);

  const hide = useCallback((file: string) => {
    setHidden((h) => new Set(h).add(file));
  }, []);
  const unhide = useCallback((file: string) => {
    setHidden((h) => {
      const n = new Set(h);
      n.delete(file);
      return n;
    });
  }, []);

  const visibleProjects = useMemo(
    () => projects.filter((p) => !hidden.has(p.__file)),
    [projects, hidden],
  );
  const visibleGoals = useMemo(() => goals.filter((g) => !hidden.has(g.__file)), [goals, hidden]);
  const groups = useMemo(
    () => goalsByProject(visibleProjects, visibleGoals),
    [visibleProjects, visibleGoals],
  );
  const allGoalTitles = useMemo(() => goals.map((g) => g.title), [goals]);
  const allProjectTitles = useMemo(() => projects.map((p) => p.title), [projects]);

  const deleteProject = (p: FileBacked<Project>) => {
    hide(p.__file);
    showUndo(`Deleted ${p.title}`, {
      onCommit: async () => {
        await removeProject(p);
        unhide(p.__file);
      },
      onUndo: () => unhide(p.__file),
    });
  };

  const deleteGoal = (g: FileBacked<Goal>) => {
    hide(g.__file);
    showUndo(`Deleted ${g.title}`, {
      onCommit: async () => {
        await removeGoal(g);
        unhide(g.__file);
      },
      onUndo: () => unhide(g.__file),
    });
  };

  const submitModal = async (title: string) => {
    const m = modal;
    setModal(CLOSED);
    switch (m.kind) {
      case 'project-add':
        return createProject(title);
      case 'project-edit':
        return updateProject({ ...m.project, title });
      case 'goal-add':
        return createGoal(title, m.projectFile);
      case 'goal-edit':
        return title === m.goal.title ? undefined : renameGoal(m.goal, title);
    }
  };

  return (
    <Screen scroll>
      <ThemedText type="subtitle">Goals</ThemedText>

      {projects.length === 0 ? (
        <ThemedText themeColor="textSecondary" className="mt-four">
          No projects yet. Tap + to add one.
        </ThemedText>
      ) : (
        <View className="mt-two">
          {groups.map((group) => (
            <ProjectGroup
              key={group.project ? group.project.__file : '__orphans'}
              project={group.project}
              goals={group.goals}
              onAddGoal={() =>
                group.project &&
                setModal({
                  kind: 'goal-add',
                  projectFile: group.project.__file,
                  projectTitle: group.project.title,
                })
              }
              onEditProject={() =>
                group.project && setModal({ kind: 'project-edit', project: group.project })
              }
              onDeleteProject={() => group.project && deleteProject(group.project)}
              onToggleGoal={(g) => updateGoal({ ...g, fulfilled: !g.fulfilled })}
              onEditGoal={(g) =>
                setModal({
                  kind: 'goal-edit',
                  goal: g,
                  projectTitle: group.project ? group.project.title : 'No project',
                })
              }
              onDeleteGoal={deleteGoal}
            />
          ))}
        </View>
      )}

      <Fab onPress={() => setModal({ kind: 'project-add' })} accessibilityLabel="Add project" />

      <ProjectFormModal
        visible={modal.kind === 'project-add' || modal.kind === 'project-edit'}
        onClose={() => setModal(CLOSED)}
        initialTitle={modal.kind === 'project-edit' ? modal.project.title : undefined}
        takenTitles={allProjectTitles}
        onSubmit={submitModal}
      />

      <GoalFormModal
        visible={modal.kind === 'goal-add' || modal.kind === 'goal-edit'}
        onClose={() => setModal(CLOSED)}
        initialTitle={modal.kind === 'goal-edit' ? modal.goal.title : undefined}
        projectTitle={
          modal.kind === 'goal-add' || modal.kind === 'goal-edit' ? modal.projectTitle : ''
        }
        takenTitles={allGoalTitles}
        onSubmit={submitModal}
      />
    </Screen>
  );
}
