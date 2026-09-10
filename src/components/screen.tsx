import type { ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Center content in a max-width column (default true). */
  contained?: boolean;
  contentClassName?: string;
};

/** Consistent page frame: fills below the top nav, safe-area bottom padding, optional scroll + max width. */
export function Screen({ children, scroll = false, contained = true, contentClassName = '' }: Props) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = { paddingBottom: insets.bottom + 16 };
  const inner = (
    <View
      className={`w-full flex-1 px-four pt-four ${contained ? 'max-w-[800px] self-center' : ''} ${contentClassName}`}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <ScrollView
        className="flex-1 bg-background dark:bg-background-dark"
        contentContainerStyle={[{ flexGrow: 1 }, pad]}>
        {inner}
      </ScrollView>
    );
  }
  return (
    <View className="flex-1 bg-background dark:bg-background-dark" style={pad}>
      {inner}
    </View>
  );
}
