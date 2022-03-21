import { useCallback, useRef } from 'react';
import { Editor } from '../components/Editor';
import { Button } from '../components/Button';

const Edit = () => {
  const textRef = useRef('');
  const handleSubmit = useCallback(() => {
    // get values
    console.log(textRef.current);
  }, []);
  return (
    <div>
      <h1>Editor</h1>
      <Editor textRef={textRef} />
      <Button onClick={handleSubmit}>Go</Button>
    </div>
  );
};

export default Edit;
