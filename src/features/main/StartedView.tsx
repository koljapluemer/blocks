import { useKeepAwake } from 'expo-keep-awake';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { HoldButton } from '@/components/ui/hold-button';
import { useTimer } from '@/lib/timer/TimerProvider';
import { useCountdown } from '@/lib/timer/useCountdown';

export function StartedView() {
  const { state, abort } = useTimer();
  const endAt = state.phase === 'started' ? state.endAt : null;
  const { label } = useCountdown(endAt);
  useKeepAwake();

  if (state.phase !== 'started') return null;

  return (
    <View className="flex-1 items-center justify-center gap-five">
      <ThemedText type="subtitle" className="text-center">
        {state.goal}
      </ThemedText>

      <ThemedText style={{ fontSize: 72, lineHeight: 80, fontWeight: '700' }}>{label}</ThemedText>

      <View className="w-full">
        <HoldButton label="Abort" variant="danger" durationMs={300} onComplete={abort} />
      </View>
    </View>
  );
}
