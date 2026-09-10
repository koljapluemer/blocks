import { X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { blockColor } from '@/lib/models/color';
import type { Block, FileBacked } from '@/lib/models/types';

const SIZE = 18;

type Props = {
  block: FileBacked<Block>;
  active: boolean;
  onPress: () => void;
};

export function BlockSquare({ block, active, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityLabel={`Block: ${block.goal}`}
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: block.isClean ? blockColor(block.goal) : 'transparent',
        borderWidth: active ? 2 : 0,
        borderColor: theme.text,
      }}>
      {!block.isClean && <X size={SIZE - 2} color={theme.textSecondary} strokeWidth={2} />}
    </Pressable>
  );
}
