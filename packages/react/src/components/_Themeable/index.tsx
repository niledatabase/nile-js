import React from 'react';

import { useTheme, InputThemeName } from '../../theme';

type LabelCallbackProps = { htmlFor: InputThemeName };
type InputCallbackProps = { id: InputThemeName };
type LabelThemeNode =
  | null
  | React.ReactNode
  | ((props: LabelCallbackProps) => React.ReactNode);
type InputThemeNode =
  | null
  | React.ReactNode
  | ((props: InputCallbackProps) => React.ReactNode);

export function Input({
  name,
  node,
}: {
  name: InputThemeName;
  node: InputThemeNode;
}) {
  const theme = useTheme(name);
  if (node === null) {
    return null;
  }

  const props = { id: name };

  if (typeof node === 'function') {
    return <>{node(props)}</>;
  }

  if (React.isValidElement(node)) {
    return <>{React.cloneElement(node, props)}</>;
  }

  return (
    <input className={String(theme)} type="text" placeholder={name} id={name} />
  );
}

export function Label({
  htmlFor,
  text,
  node,
}: {
  text: string;
  htmlFor: InputThemeName;
  node: LabelThemeNode;
}) {
  const theme = useTheme(htmlFor);
  if (node === null) {
    return null;
  }

  const props = { htmlFor };

  if (typeof node === 'function') {
    return <>{node(props)}</>;
  }

  if (React.isValidElement(node)) {
    return <>{React.cloneElement(node, props)}</>;
  }

  return (
    <label className={String(theme)} htmlFor={htmlFor}>
      {text}
    </label>
  );
}
