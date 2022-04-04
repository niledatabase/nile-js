import { useMemo } from 'react';
import { useNileContextTheme } from '../context';


const ThemeConfig = {
    'email': 'email',
    'password': 'password',
    'signupButton': 'signupButton'
}
export type InputThemeName = 'email' | 'password' | 'signupButton';

export const useTheme = (name: InputThemeName) => {
    const contextTheme = useNileContextTheme();
    const override = typeof contextTheme === 'object' && contextTheme[name];
    return useMemo(() => {
        if (typeof override === 'function') {
            return override;
        }
        return `${contextTheme}-${ThemeConfig[name]}`;
    }, [name]);
};
