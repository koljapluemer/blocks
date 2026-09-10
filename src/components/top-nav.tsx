import { usePathname, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInteractionsOptional } from '@/lib/store/InteractionContext';

import { ThemedText } from './themed-text';

const ITEMS = [
  { href: '/', label: 'Main' },
  { href: '/diary', label: 'Diary' },
  { href: '/goals', label: 'Goals' },
  { href: '/settings', label: 'Settings' },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bump } = useInteractionsOptional();

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="w-full items-center border-b border-background-element bg-background dark:border-background-element-dark dark:bg-background-dark">
      <View className="w-full max-w-[800px] flex-row justify-around px-three pb-two">
        {ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => {
                bump();
                router.replace(item.href);
              }}
              className={`rounded-three px-three py-one ${
                active
                  ? 'bg-background-selected dark:bg-background-selected-dark'
                  : ''
              }`}>
              <ThemedText
                type={active ? 'smallBold' : 'small'}
                themeColor={active ? 'text' : 'textSecondary'}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
