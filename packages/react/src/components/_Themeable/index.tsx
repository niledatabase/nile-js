
import React from 'react';

import { useTheme, InputThemeName } from '../../theme';

export function Input({ name }: { name: InputThemeName }) {
    const theme = useTheme(name);
    if (typeof theme === 'function') {
        return <>{theme}</>
    }

    return <input className={theme} type="text" placeholder={name} id={name} > </input>

}

export function Label({ htmlFor, text }: { text: string, htmlFor: InputThemeName}) {

    const theme = useTheme(htmlFor);
    if (typeof theme === 'function') {
        return <>{theme}</>
    }

    return <label className={theme} htmlFor={htmlFor}>{text}</label>
}