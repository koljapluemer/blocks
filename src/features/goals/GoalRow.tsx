import { Check, Circle, Pencil, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { useTheme } from '@/hooks/use-theme';
import type { FileBacked, Goal } from '@/lib/models/types';

type Props = {
  goal: FileBacked<Goal>;
  onToggleFulfilled: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function GoalRow({ goal, onToggleFulfilled, onEdit, onDelete }: Props) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center gap-two py-two">
      <IconButton
        icon={goal.fulfilled ? Check : Circle}
        color={goal.fulfilled ? theme.text : theme.textSecondary}
        onPress={onToggleFulfilled}
        accessibilityLabel={goal.fulfilled ? 'Mark goal unfulfilled' : 'Mark goal fulfilled'}
      />
      <ThemedText
        className="flex-1"
        themeColor={goal.fulfilled ? 'textSecondary' : 'text'}
        style={goal.fulfilled ? { textDecorationLine: 'line-through' } : undefined}>
        {goal.title}
      </ThemedText>
      <IconButton icon={Pencil} onPress={onEdit} accessibilityLabel="Edit goal" />
      <IconButton icon={Trash2} onPress={onDelete} accessibilityLabel="Delete goal" />
    </View>
  );
}
