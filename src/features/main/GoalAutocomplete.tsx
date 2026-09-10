import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { autocompleteEntries } from '@/lib/models/derive';
import { useData } from '@/lib/store/StoreProvider';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
};

export function GoalAutocomplete({ value, onChangeText }: Props) {
  const { projects, goals } = useData();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const entries = useMemo(() => autocompleteEntries(projects, goals), [projects, goals]);
  const query = value.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!query) return [];
    return entries.filter((e) => e.label.toLowerCase().includes(query)).slice(0, 8);
  }, [entries, query]);

  const open = focused && matches.length > 0;

  return (
    <View className="relative z-20">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder="What's the goal?"
        placeholderTextColor={theme.textSecondary}
        autoFocus
        className="rounded-two border border-background-selected px-three py-three text-[16px] text-text dark:border-background-selected-dark dark:text-text-dark"
      />
      {open && (
        <View className="absolute left-0 right-0 top-[52px] z-20 overflow-hidden rounded-two border border-background-selected bg-background dark:border-background-selected-dark dark:bg-background-dark">
          <ScrollView keyboardShouldPersistTaps="always" style={{ maxHeight: 240 }}>
            {matches.map((m) => (
              <Pressable
                key={m.label}
                onPress={() => {
                  onChangeText(m.goal);
                  setFocused(false);
                }}
                className="border-b border-background-element px-three py-two dark:border-background-element-dark">
                <ThemedText type="small">{m.label}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
