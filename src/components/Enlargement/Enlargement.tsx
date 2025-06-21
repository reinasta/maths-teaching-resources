import React from "react";

const Enlargement: React.FC = () => (
  <div className="flex flex-col gap-8">
    <div>
      <h2 className="text-2xl font-semibold mb-4">Enlargement</h2>
      <div data-testid="enlargement-canvas">
        <video
          data-testid="enlargement-video"
          controls
          className="w-full rounded-lg shadow-lg"
          preload="metadata"
          playsInline
        >
          <source
            src="/videos/components/EnlargementScene.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
);

export default Enlargement;
