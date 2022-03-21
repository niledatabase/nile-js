import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useCallback, type MutableRefObject } from 'react';

type EditorProps = {
  textRef: MutableRefObject<string>;
  height: string,
};
export const Editor = ({ textRef, height }: EditorProps)=>{
  const handleChange = useCallback(
    (value) => {
      // don't re-render... for now
      textRef.current = value;
    },
    [textRef]
  );
  return (
    <CodeMirror 
        height={height} 
        extensions={[javascript({ jsx: true })]} 
        onChange={handleChange}
    />
  );
}
Editor.defaultProps = {
    height:'200px'
}

