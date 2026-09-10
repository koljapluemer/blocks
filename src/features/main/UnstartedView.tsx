import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { HoldButton } from '@/components/ui/hold-button';
import { useTheme } from '@/hooks/use-theme';
import { useTimer } from '@/lib/timer/TimerProvider';

import { GoalAutocomplete } from './GoalAutocomplete';

export function UnstartedView() {
  const { state, setGoal, markVisualized, start } = useTimer();
  const theme = useTheme();
  if (state.phase !== 'unstarted') return null;

  const hasGoal = state.goal.trim().length > 0;

  return (
    <View className="flex-1 justify-center gap-five">
      <GoalAutocomplete value={state.goal} onChangeText={setGoal} />

      {state.visualized ? (
        <View className="gap-three">
          <View className="flex-row items-center justify-center gap-two">
            <Check size={20} color={theme.text} strokeWidth={2} />
            <ThemedText type="smallBold">Goal Visualized</ThemedText>
          </View>
          <Button label="Start" onPress={start} />
        </View>
      ) : (
        <HoldButton
          label="I have visualized the goal"
          durationMs={1000}
          onComplete={markVisualized}
          disabled={!hasGoal}
        />
      )}
    </View>
  );
}
