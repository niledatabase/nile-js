import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '../components/Editor';
import { Button } from '../components/Button';
import { useRouter } from 'next/router';
import nile from '../utilities/nile';
import { ComponentList } from '../components/ComponentList';

const Edit = () => {
  const router = useRouter();
  const textRef = useRef('');
  const [error, setError] = useState<null | string>(null);
  const [users, setUsers] = useState();
  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const parsed = JSON.parse(textRef.current);
      const updated = await nile.update('user', parsed);
      if (updated.status === 404) {
        setError('Entity not found');
      }
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    async function getUsers() {
      if (nile.authToken) {
        const users = await nile.read('users');
        if (users.status === 200) {
          setUsers(users);
        }
      }
    }
    getUsers();
  }, [nile.authToken]);

  if (!nile.authToken && typeof window !== 'undefined') {
    router.push('/signin?redirect=editor');
  }

  return (
    <div>
      <h1>Editor</h1>
      {error && <p>{error}</p>}
      <Editor textRef={textRef} />
      <Button onClick={handleSubmit}>Update user</Button>
      <br />
      <br />
      {JSON.stringify(users, null, 2)}
      <ComponentList />
    </div>
  );
};

export default Edit;
