import { Pencil, Plus, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import type { FileBacked, Goal, Project } from '@/lib/models/types';

import { GoalRow } from './GoalRow';

type Props = {
  project: FileBacked<Project> | null;
  goals: FileBacked<Goal>[];
  onAddGoal: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onToggleGoal: (g: FileBacked<Goal>) => void;
  onEditGoal: (g: FileBacked<Goal>) => void;
  onDeleteGoal: (g: FileBacked<Goal>) => void;
};

export function ProjectGroup({
  project,
  goals,
  onAddGoal,
  onEditProject,
  onDeleteProject,
  onToggleGoal,
  onEditGoal,
  onDeleteGoal,
}: Props) {
  return (
    <View className="gap-one border-b border-background-element py-three dark:border-background-element-dark">
      <View className="flex-row items-center gap-two">
        <ThemedText type="smallBold" className="flex-1 uppercase" themeColor="textSecondary">
          {project ? project.title : 'No project'}
        </ThemedText>
        {project && (
          <>
            <IconButton icon={Plus} onPress={onAddGoal} accessibilityLabel="Add goal to project" />
            <IconButton icon={Pencil} onPress={onEditProject} accessibilityLabel="Edit project" />
            <IconButton
              icon={Trash2}
              onPress={onDeleteProject}
              accessibilityLabel="Delete project"
            />
          </>
        )}
      </View>

      {goals.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" className="py-two">
          No goals yet.
        </ThemedText>
      ) : (
        goals.map((g) => (
          <GoalRow
            key={g.__file}
            goal={g}
            onToggleFulfilled={() => onToggleGoal(g)}
            onEdit={() => onEditGoal(g)}
            onDelete={() => onDeleteGoal(g)}
          />
        ))
      )}
    </View>
  );
}
