// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useRef, useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';

import { NileContext, NileProviderProps } from './types';

const defaultContext: NileContext = {
  instance: Nile({ basePath: '', workspace: 'none' }),
  workspace: '',
  theme: '',
};

const context = createContext<NileContext>(defaultContext);
const { Provider } = context;

export const NileProvider = (props: NileProviderProps) => {
  const { children } = props;
  const initalized = useRef(false);

  const values = useMemo<NileContext>(() => {
    if (initalized.current === true) {
      // eslint-disable-next-line no-console
      console.warn(
        'Another instance of nile was created. Reauthentication is required.'
      );
    }
    initalized.current = true;
    return {
      instance: Nile({ basePath: props.basePath, workspace: props.workspace }),
      theme: props.theme,
    };
  }, [props.basePath, props.theme, props.workspace]);

  return <Provider value={values}>{children}</Provider>;
};

const useNileContext = (): NileContext => {
  return useContext(context);
};

export const useNile = (): NileApi => {
  return useNileContext().instance;
};

export const useNileContextTheme = (): void | string => {
  return useNileContext().theme;
};
