import React, { useEffect, useRef } from 'react';

interface PixelAvatarProps {
  hash: string;
  color: string;
  size?: number;
  className?: string;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({ hash, color, size = 100, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grid size 5x5 for identicon style
    const gridSize = 5;
    const pixelSize = canvas.width / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set color
    ctx.fillStyle = color;

    // Generate symmetrical pattern
    // We only need to generate the left 3 columns, then mirror
    for (let x = 0; x < Math.ceil(gridSize / 2); x++) {
      for (let y = 0; y < gridSize; y++) {
        // Use hash characters to determine if pixel is on or off
        // We cycle through the hash string
        const charIndex = (x * gridSize + y) % hash.length;
        const hexVal = parseInt(hash[charIndex], 16);
        
        // Simple threshold: if even, draw pixel. 
        // We can make it more complex later.
        if (hexVal % 2 === 0) {
          // Draw left side
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          
          // Draw right side (mirror)
          if (x < Math.floor(gridSize / 2)) {
            ctx.fillRect((gridSize - 1 - x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    }
  }, [hash, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={`image-pixelated ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default PixelAvatar;
