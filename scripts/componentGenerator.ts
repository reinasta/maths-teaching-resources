import { VideoEntry } from './markdownParser';

export function generateComponentFiles(entry: VideoEntry): Record<string, string> {
  const { componentName, videoFile, videoPath, description } = entry;
  const displayName = componentName.replace(/([A-Z])/g, ' $1').trim();
  const baseTestId = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const videoTestId = baseTestId + '-video';
  const canvasTestId = baseTestId + '-canvas';
  const component = `import React from "react";

const ${componentName}: React.FC = () => (
  <div className="flex flex-col gap-8">
    <div>
      <h2 className="text-2xl font-semibold mb-4">${displayName}</h2>
      <div data-testid="${canvasTestId}">
        <video
          data-testid="${videoTestId}"
          controls
          className="w-full rounded-lg shadow-lg"
          preload="metadata"
          playsInline
        >
          <source
            src="/${videoPath}"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
);

export default ${componentName};
`;
  const index = `export { default } from "./${componentName}";\n`;
  return {
    [`${componentName}.tsx`]: component,
    'index.tsx': index
  };
}
