import React from "react";

const AreaUnderGraphs = () => (
  <div className="flex flex-col gap-8">
    <div>
      <h2 className="text-2xl font-semibold mb-4">Area Under Graphs</h2>
      <video
        data-testid="area-under-graphs-video"
        controls
        className="w-full rounded-lg shadow-lg"
        preload="metadata"
        playsInline
      >
        <source
          src="/videos/components/AreaUnderGraphsScene.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
);

export default AreaUnderGraphs;
