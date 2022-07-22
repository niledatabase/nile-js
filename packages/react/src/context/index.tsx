// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useMemo, createContext, useContext } from 'react';
import Nile, { NileApi } from '@theniledev/js';

import { NileContext, NileProviderProps } from './types';

const defaultContext: NileContext = {
  instance: Nile({ basePath: '', workspace: 'none', credentials: 'include' }),
  workspace: '',
  theme: '',
};

const context = createContext<NileContext>(defaultContext);
const { Provider } = context;

export const NileProvider = (props: NileProviderProps) => {
  const { children } = props;

  const values = useMemo<NileContext>(() => {
    return {
      instance: Nile({
        basePath: props.basePath,
        workspace: props.workspace,
        credentials: 'include',
      }),
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
