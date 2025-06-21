import { generateComponentFiles } from '../componentGenerator';
import { VideoEntry } from '../markdownParser';

describe('generateComponentFiles', () => {
  it('generates React component and index file content', () => {
    const entry: VideoEntry = {
      componentName: 'AreaUnderGraphs',
      videoFile: 'AreaUnderGraphsScene.mp4',
      videoPath: 'videos/components/AreaUnderGraphsScene.mp4',
      description: 'Video demonstration about calculating the area under graphs.'
    };
    const files = generateComponentFiles(entry);
    expect(files['AreaUnderGraphs.tsx']).toContain('<video');
    expect(files['AreaUnderGraphs.tsx']).toContain('Area Under Graphs');
    expect(files['AreaUnderGraphs.tsx']).toContain('/videos/components/AreaUnderGraphsScene.mp4');
    expect(files['index.tsx']).toContain('export { default } from');
  });
});
