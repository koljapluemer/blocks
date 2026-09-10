import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TopNav } from '@/components/top-nav';
import { FolderGate } from '@/lib/store/FolderGate';
import { StoreProvider } from '@/lib/store/StoreProvider';

import '@/global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StoreProvider>
          <View style={{ flex: 1 }}>
            <TopNav />
            <View style={{ flex: 1 }}>
              <FolderGate>
                <Slot />
              </FolderGate>
            </View>
          </View>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
