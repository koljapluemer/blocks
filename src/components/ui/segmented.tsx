import { Pressable, Text, View } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: [Option<T>, Option<T>];
  /** null = nothing chosen yet (the "no default state" pattern). */
  value: T | null;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View className="flex-row gap-two">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`flex-1 items-center rounded-two border px-three py-three ${
              selected
                ? 'border-text bg-text dark:border-text-dark dark:bg-text-dark'
                : 'border-background-selected dark:border-background-selected-dark'
            }`}>
            <Text
              className={`text-[14px] font-semibold ${
                selected
                  ? 'text-background dark:text-background-dark'
                  : 'text-text dark:text-text-dark'
              }`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
