import React from 'react';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  children: string;
  onClick?: () => void;
  node: React.ReactNode;
};

export function Button(props: ButtonProps) {
  const { node, type, children, onClick } = props;
  if (React.isValidElement(node)) {
    const props = { onClick };
    return React.cloneElement(node, props);
  }
  return (
    <button type={type ?? 'button'} onClick={onClick}>
      {children}
    </button>
  );
}
