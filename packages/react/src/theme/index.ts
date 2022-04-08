import { useMemo } from 'react';

import { useNileContextTheme } from '../context';

const ThemeConfig = {
  email: 'email',
  password: 'password',
  signupButton: 'signupButton',
  loginButton: 'loginButon',
};

export type InputThemeName = 'email' | 'password';
export type ButtonThemeName = 'signupButton' | 'loginButton';

export const useTheme = (name: InputThemeName | ButtonThemeName) => {
  const contextTheme = useNileContextTheme();
  return useMemo(() => {
    if (!contextTheme) {
      return ThemeConfig[name];
    }
    return `${contextTheme}-${ThemeConfig[name]}`;
  }, [contextTheme, name]);
};
