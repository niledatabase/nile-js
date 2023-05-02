import { sub } from 'date-fns';
import React, {
  useMemo,
  Dispatch,
  useCallback,
  createContext,
  useContext,
} from 'react';

import { allowedUpdateInterval } from '../../../lib/utils/refresh';

import { oneHourWindow } from './timeWindows';

enum Actions {
  SetTimes = '@nile/setMetricTimes',
  SetInterval = '@nile/setMetricRefresh',
}

type Times = {
  endTime: Date;
  startTime: Date;
};

type Interval = {
  updateInterval: void | number;
};
type State = Times & Interval;
type DispatchAction = (Times | Interval) & { type: Actions };
type Reducer = (state: State, action: DispatchAction) => State;

const Context = createContext<[State, Dispatch<DispatchAction>]>([
  {
    ...oneHourWindow(sub(new Date(), { hours: 1 })),
    updateInterval: undefined,
  },
  () => null,
]);

Context.displayName = 'MetricsProvider';

type ProviderProps = { children: React.ReactNode };

const reducer: Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case Actions.SetTimes:
      return { ...state, ...payload };
    case Actions.SetInterval:
      return { ...state, ...payload };

    default:
      return state;
  }
};

export function Provider(props: ProviderProps) {
  const { children } = props;

  const [state, dispatch] = React.useReducer(reducer, {
    ...oneHourWindow(sub(new Date(), { hours: 1 })),
    updateInterval: undefined,
  });
  const values: [State, Dispatch<DispatchAction>] = React.useMemo(
    () => [state, dispatch],
    [state]
  );
  return <Context.Provider value={values}>{children}</Context.Provider>;
}

export const useMetricsTime = () => {
  const [state] = useContext(Context);
  return useMemo(() => state, [state]);
};

export const useSetMetricsUpdateInterval = () => {
  const [, dispatch] = useContext(Context);
  return useCallback(
    (updateInterval: number) => {
      const interval = allowedUpdateInterval(updateInterval);
      if (interval) {
        dispatch({ type: Actions.SetInterval, updateInterval });
      }
    },
    [dispatch]
  );
};

export const useMetricsUpdateInterval = () => {
  const [state] = useContext(Context);
  return useMemo(() => state.updateInterval, [state.updateInterval]);
};

// probably want to use the helper methods vs this
export const useSetTimes = () => {
  const [, dispatch] = useContext(Context);
  return useCallback(
    (times: Times) => dispatch({ type: Actions.SetTimes, ...times }),
    [dispatch]
  );
};

export const useOneHourWindow = () => {
  const setTimes = useSetTimes();
  return useCallback(
    (time: Date) => {
      setTimes(oneHourWindow(time));
    },
    [setTimes]
  );
};
