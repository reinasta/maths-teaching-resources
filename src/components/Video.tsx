
import React from 'react';

interface VideoProps {
  src: string;
  type?: string;
}

export function Video({ src, type = 'video/mp4' }: VideoProps) {
  return (
    <video 
      controls
      className="w-full rounded-lg shadow-lg"
      preload="metadata"
      playsInline
    >
      <source src={src} type={type} />
      Your browser does not support the video tag.
    </video>
  );
}
