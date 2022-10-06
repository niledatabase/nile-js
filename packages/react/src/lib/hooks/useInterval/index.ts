import React from 'react';

export const useInterval = (cb: () => void, delay: void | number) => {
  const savedCallback = React.useRef(cb);

  React.useEffect(() => {
    savedCallback.current = cb;
  }, [cb]);

  React.useEffect(() => {
    if (!delay) {
      return;
    }
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};
