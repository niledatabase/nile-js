import React from 'react';

import { useTheme, ButtonThemeName } from '../../theme';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  name: ButtonThemeName;
  text: string;
  node: React.ReactNode;
};

export default function Button(props: ButtonProps) {
  const { type, text, onClick, name, node } = props;
  const theme = useTheme(name);

  const buttonType = type ?? 'button';
  if (React.isValidElement(node)) {
    const combineOnClick = (e: MouseEvent) => {
      const submit = node.props.onClick && node.props.onClick(e);
      if (submit) {
        onClick && onClick();
      }
    };
    const props = { onClick: combineOnClick, type: buttonType };
    return React.cloneElement(node, props);
  }

  return (
    <button className={String(theme)} type={buttonType} onClick={onClick}>
      {text}
    </button>
  );
}
