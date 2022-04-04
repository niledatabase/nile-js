import React from 'react';
import { useTheme } from '../../theme';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  name: 'signupButton';
  text: string;
};

export default function Button(props: ButtonProps) {
  const { type, text, onClick, name } = props;
  const theme = useTheme(name);
  if (typeof theme === 'function') {
    return <>{theme}</>
  }


  return (
    <button className={theme} type={type ?? 'button'} onClick={onClick} role="button">
      {text}
    </button>
  );
}
