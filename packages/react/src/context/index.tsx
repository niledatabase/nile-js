// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import React, { useRef, useMemo, createContext, useContext } from 'react';
import { NileContext, NileProviderProps } from './types';
import Nile, { NileApi } from '@theniledev/js';

const defaultContext: NileContext = {
  instance: Nile({ apiUrl: '' }),
  theme: ''
};

const context = createContext<NileContext>(defaultContext);
const { Provider } = context;

export const NileProvider = (props: NileProviderProps) => {
  const { children } = props;
  const initalized = useRef(false);
  const values = useMemo<NileContext>(() => {
    if (initalized.current === true) {
      console.warn(
        'Another instance of nile was created. Reauthentication is required. Move the `<NileProvider />` to a component higher in the render tree.'
      );
    }
    initalized.current = true;
    return {
      instance: Nile({ apiUrl: props.apiUrl }),
      theme: props.theme,
    };
  }, [props.apiUrl, props.theme]);

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
}