import sub from 'date-fns/sub';
import React, { useMemo, Dispatch, useCallback } from 'react';

import { oneHourWindow } from './timeWindows';

enum Actions {
  Set = '@nile/setTime',
}

export type State = {
  endTime: Date;
  startTime: Date;
};

type Reducer = (state: State, action: State & { type: Actions }) => State;

const Context = React.createContext<
  [State, Dispatch<State & { type: Actions }>]
>([oneHourWindow(sub(new Date(), { hours: 1 })), () => null]);

Context.displayName = 'MetricsProvider';

type ProviderProps = { children: React.ReactNode };

const reducer: Reducer = (state, action) => {
  const { type, ...times } = action;
  switch (type) {
    case Actions.Set:
      return times;
    default:
      return state;
  }
};

export function Provider(props: ProviderProps) {
  const { children } = props;

  const [state, dispatch] = React.useReducer(
    reducer,
    oneHourWindow(sub(new Date(), { hours: 1 }))
  );
  const values: [State, Dispatch<State & { type: Actions }>] = React.useMemo(
    () => [state, dispatch],
    [state]
  );
  return <Context.Provider value={values}>{children}</Context.Provider>;
}

export const useMetricsTime = () => {
  const [state] = React.useContext(Context);
  return useMemo(() => state, [state]);
};

// probably want to use the helper methods vs this
export const useSetTimes = () => {
  const [, dispatch] = React.useContext(Context);
  return useCallback(
    (times: State) => dispatch({ type: Actions.Set, ...times }),
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
