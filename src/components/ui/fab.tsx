import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useInteractionsOptional } from '@/lib/store/InteractionContext';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function Fab({ onPress, accessibilityLabel }: Props) {
  const { bump } = useInteractionsOptional();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        bump();
        onPress();
      }}
      style={({ pressed }) => [
        { position: 'absolute', right: 24, bottom: insets.bottom + 24 },
        pressed ? { opacity: 0.8 } : undefined,
      ]}
      className="h-14 w-14 items-center justify-center rounded-full bg-text dark:bg-text-dark">
      <Plus size={24} color={theme.background} strokeWidth={2} />
    </Pressable>
  );
}
