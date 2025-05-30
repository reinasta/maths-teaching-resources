import React from 'react';

const Enlargement: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Triangle Enlargement</h2>
        <video 
          data-testid="enlargement-canvas"
          controls
          className="w-full rounded-lg shadow-lg"
          preload="metadata"
          playsInline
        >
          <source src="/videos/components/EnlargementDemo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Pentagon Enlargement</h2>
        <video 
          controls
          className="w-full rounded-lg shadow-lg"
          preload="metadata"
          playsInline
        >
          <source src="/videos/components/EnlargementDemo2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Enlargement;