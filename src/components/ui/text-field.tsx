import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export const TextField = forwardRef<TextInput, TextInputProps>(function TextField(
  { className = '', ...props },
  ref,
) {
  const theme = useTheme();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={theme.textSecondary}
      className={`rounded-two border border-background-selected px-three py-two text-[15px] text-text dark:border-background-selected-dark dark:text-text-dark ${className}`}
      {...props}
    />
  );
});
