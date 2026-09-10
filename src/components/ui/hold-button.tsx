import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  label: string;
  /** Hold duration before completion, in ms. */
  durationMs: number;
  onComplete: () => void;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
};

const RED = '#DD2E44';

/** Press and hold; a bar fills over `durationMs`; releasing early resets. Fires `onComplete` once. */
export function HoldButton({
  label,
  durationMs,
  onComplete,
  variant = 'primary',
  disabled = false,
}: Props) {
  const progress = useSharedValue(0);
  const fired = useRef(false);
  const [width, setWidth] = useState(0);

  const fire = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onComplete();
  }, [onComplete]);

  useAnimatedReaction(
    () => progress.value >= 1,
    (done, prev) => {
      if (done && !prev) runOnJS(fire)();
    },
  );

  const onPressIn = () => {
    if (disabled) return;
    fired.current = false;
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.linear });
  };

  const onPressOut = () => {
    if (fired.current) return;
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 150 });
  };

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const danger = variant === 'danger';
  const baseText = danger ? { color: RED } : undefined;

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={`h-14 w-full overflow-hidden rounded-two border ${
        danger ? '' : 'border-background-selected dark:border-background-selected-dark'
      } ${disabled ? 'opacity-40' : ''}`}
      style={danger ? { borderColor: RED } : undefined}>
      {/* Base label */}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-[15px] font-semibold text-text dark:text-text-dark" style={baseText}>
          {label}
        </Text>
      </View>
      {/* Fill sweeping left-to-right, revealing an inverted label */}
      <Animated.View
        style={[fillStyle, danger ? { backgroundColor: RED } : undefined]}
        className={`absolute bottom-0 left-0 top-0 overflow-hidden ${
          danger ? '' : 'bg-text dark:bg-text-dark'
        }`}>
        <View style={{ width, height: '100%' }} className="items-center justify-center">
          <Text
            className={`text-[15px] font-semibold ${
              danger ? 'text-white' : 'text-background dark:text-background-dark'
            }`}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
