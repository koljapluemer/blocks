import { useRouter } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { useData } from '@/lib/store/StoreProvider';
import { useFolder } from '@/lib/store/StoreProvider';

function prettyFolder(uri: string): string {
  try {
    const afterTree = uri.includes('/tree/') ? uri.split('/tree/')[1] : uri;
    const decoded = decodeURIComponent(afterTree).replace(/^primary:/, '');
    return decoded || uri;
  } catch {
    return uri;
  }
}

export function SettingsScreen() {
  const { folderUri, isConfigured, pickFolder } = useFolder();
  const { projects, goals, blocks, loading, loadError, reload } = useData();
  const router = useRouter();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  const onPick = async () => {
    setBusy(true);
    try {
      const chosen = await pickFolder();
      if (chosen) router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <View className="gap-four">
        <ThemedText type="subtitle">Settings</ThemedText>

        {!isConfigured && (
          <ThemedText themeColor="textSecondary">
            Pick the folder blocks reads and writes.
          </ThemedText>
        )}

        <View className="gap-one">
          <ThemedText type="smallBold">Data folder</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {folderUri ? prettyFolder(folderUri) : 'Not set'}
          </ThemedText>
        </View>

        <Button label={isConfigured ? 'Change folder' : 'Choose folder'} onPress={onPick} busy={busy} />

        {isConfigured && (
          <View className="flex-row items-center justify-between">
            <ThemedText type="small" themeColor="textSecondary">
              {projects.length} projects · {goals.length} goals · {blocks.length} blocks
              {loading ? ' · loading…' : ''}
            </ThemedText>
            <Pressable onPress={() => reload()} hitSlop={12} className="p-one">
              <RefreshCw size={18} color={theme.textSecondary} strokeWidth={1.75} />
            </Pressable>
          </View>
        )}

        {loadError && (
          <ThemedText type="small" style={{ color: '#DD2E44' }}>
            {loadError}
          </ThemedText>
        )}
      </View>
    </Screen>
  );
}
