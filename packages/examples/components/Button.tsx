import React from 'react';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  children: string;
  onClick?: () => void;
};

export function Button(props: ButtonProps) {
  const { type, children, onClick } = props;
  return (
    <button type={type ?? 'button'} onClick={onClick}>
      {children}
    </button>
  );
}
