import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { useTimer } from '@/lib/timer/TimerProvider';

export function EvaluateView() {
  const { state, setCount, doAnother, newGoal } = useTimer();
  if (state.phase !== 'evaluate') return null;

  const value = state.count === null ? null : state.count ? 'count' : 'skip';

  return (
    <View className="flex-1 justify-center gap-five">
      <ThemedText type="subtitle" className="text-center">
        You worked on{'\n'}
        {state.goal}
      </ThemedText>

      <Segmented
        options={[
          { value: 'count', label: 'Count it' },
          { value: 'skip', label: "Don't count" },
        ]}
        value={value}
        onChange={(v) => setCount(v === 'count')}
      />

      <View className="gap-three">
        <Button label="Do another" onPress={doAnother} disabled={state.count === null} />
        <Button
          label="Set new goal"
          variant="secondary"
          onPress={newGoal}
          disabled={state.count === null}
        />
      </View>
    </View>
  );
}
