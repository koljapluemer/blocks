import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Block, FileBacked } from '@/lib/models/types';

import { BlockSquare } from './BlockSquare';

type Props = {
  label: string;
  blocks: FileBacked<Block>[];
  activeFile: string | null;
  onSelect: (b: FileBacked<Block>) => void;
};

export function DayRow({ label, blocks, activeFile, onSelect }: Props) {
  return (
    <View className="flex-row gap-three border-b border-background-element py-three dark:border-background-element-dark">
      <ThemedText type="small" themeColor="textSecondary" className="w-20 pt-half">
        {label}
      </ThemedText>
      <View className="flex-1 flex-row flex-wrap gap-one">
        {blocks.map((b) => (
          <BlockSquare
            key={b.__file}
            block={b}
            active={b.__file === activeFile}
            onPress={() => onSelect(b)}
          />
        ))}
      </View>
    </View>
  );
}
