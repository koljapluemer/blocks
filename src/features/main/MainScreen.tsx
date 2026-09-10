import { Screen } from '@/components/screen';
import { useTimer } from '@/lib/timer/TimerProvider';

import { EvaluateView } from './EvaluateView';
import { StartedView } from './StartedView';
import { UnstartedView } from './UnstartedView';

export function MainScreen() {
  const { state } = useTimer();

  return (
    <Screen>
      {state.phase === 'unstarted' && <UnstartedView />}
      {state.phase === 'started' && <StartedView />}
      {state.phase === 'evaluate' && <EvaluateView />}
    </Screen>
  );
}
