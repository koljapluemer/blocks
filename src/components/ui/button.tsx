import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useInteractionsOptional } from '@/lib/store/InteractionContext';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  busy?: boolean;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  className = '',
}: Props) {
  const { bump } = useInteractionsOptional();
  const isPrimary = variant === 'primary';
  const off = disabled || busy;

  return (
    <Pressable
      onPress={() => {
        bump();
        onPress();
      }}
      disabled={off}
      className={`flex-row items-center justify-center rounded-two px-four py-three ${
        isPrimary
          ? 'bg-text dark:bg-text-dark'
          : 'border border-background-selected dark:border-background-selected-dark'
      } ${off ? 'opacity-40' : ''} ${className}`}>
      {busy ? (
        <ActivityIndicator color={isPrimary ? '#fff' : '#888'} />
      ) : (
        <Text
          className={`text-[15px] font-semibold ${
            isPrimary
              ? 'text-background dark:text-background-dark'
              : 'text-text dark:text-text-dark'
          }`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
