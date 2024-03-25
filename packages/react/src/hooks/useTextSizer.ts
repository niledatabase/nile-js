import { useEffect, useState } from 'react';

export default function useTextSizer() {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    if (canvasContext) {
      canvasContext.font = '18px Roboto';
      setCtx(canvasContext);
    }
  }, []);
  return ctx;
}
