import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ visible, onClose, title, children, footer }: Props) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/40 px-four">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] gap-four rounded-two bg-background p-four dark:bg-background-dark">
          {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
          {children}
          {footer ? <View className="flex-row justify-end gap-two">{footer}</View> : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
