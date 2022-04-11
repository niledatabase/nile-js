import { useMemo } from 'react';

import { useNileContextTheme } from '../context';

const ThemeConfig = {
  email: 'email',
  password: 'password',
  signupButton: 'signupButton',
  loginButton: 'loginButton',
};

export type InputThemeName = 'email' | 'password';
export type ButtonThemeName = 'signupButton' | 'loginButton';
export type LabelOverride = (props: { htmlFor: string }) => React.ReactNode;
export type InputOverride = (props: { id: string }) => React.ReactNode;

export const useTheme = (name: InputThemeName | ButtonThemeName) => {
  const contextTheme = useNileContextTheme();
  return useMemo(() => {
    if (!contextTheme) {
      return ThemeConfig[name];
    }
    return `${contextTheme}-${ThemeConfig[name]}`;
  }, [contextTheme, name]);
};
