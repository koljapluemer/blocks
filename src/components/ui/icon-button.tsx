import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useInteractionsOptional } from '@/lib/store/InteractionContext';

type Props = {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  color?: string;
  accessibilityLabel: string;
  disabled?: boolean;
};

export function IconButton({
  icon: Icon,
  onPress,
  size = 20,
  color,
  accessibilityLabel,
  disabled = false,
}: Props) {
  const { bump } = useInteractionsOptional();
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={10}
      onPress={() => {
        bump();
        onPress();
      }}
      className={`p-one ${disabled ? 'opacity-30' : ''}`}
      style={({ pressed }) => (pressed ? { opacity: 0.5 } : undefined)}>
      <Icon size={size} color={color ?? theme.textSecondary} strokeWidth={1.75} />
    </Pressable>
  );
}
