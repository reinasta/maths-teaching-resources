import React from 'react';

const EquationOfCircle: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Equation of a Circle</h2>
        <video
          data-testid="equation-of-circle-video"
          controls
          className="w-full rounded-lg shadow-lg"
          preload="metadata"
          playsInline
        >
          <source src="/videos/components/PythagorasCircleIllustration.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default EquationOfCircle;
