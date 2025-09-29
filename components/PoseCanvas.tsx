
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { PoseCanvasHandle } from '../App';

const PoseCanvas = forwardRef<PoseCanvasHandle, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      return null;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const pos = getMousePos(e);
    if (!ctx || !pos || !lastPosition.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPosition.current.x, lastPosition.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosition.current = pos;
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing.current = true;
    lastPosition.current = getMousePos(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPosition.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#1f2937'; // bg-gray-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on container, but fix internal resolution
    const resizeCanvas = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        ctx.strokeStyle = '#fef08a'; // A light yellow for visibility
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        clearCanvas();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: true });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getCanvasAsBase64: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Return with a transparent background for better blending
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;
      // Draw a transparent background
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      // Draw the original canvas content on top
      tempCtx.drawImage(canvas, 0, 0);
      return tempCanvas.toDataURL('image/png').split(',')[1];
    },
    clearCanvas: clearCanvas
  }));

  return (
      <canvas ref={canvasRef} className="w-full h-auto aspect-square bg-gray-800 rounded-lg border-2 border-gray-600 cursor-crosshair touch-none"></canvas>
  );
});

export default PoseCanvas;
