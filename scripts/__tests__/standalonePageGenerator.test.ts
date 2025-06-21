import { generateStandalonePage } from '../standalonePageGenerator';
import { VideoEntry } from '../markdownParser';

describe('generateStandalonePage', () => {
  it('generates a Next.js standalone page for the video component', () => {
    const entry: VideoEntry = {
      componentName: 'AreaUnderGraphs',
      videoFile: 'AreaUnderGraphsScene.mp4',
      videoPath: 'videos/components/AreaUnderGraphsScene.mp4',
      description: 'Video demonstration about calculating the area under graphs.'
    };
    const page = generateStandalonePage(entry);
    expect(page).toContain('StandaloneLayout');
    expect(page).toContain('AreaUnderGraphs');
    expect(page).toContain('Area Under Graphs Video');
    expect(page).toContain('Video demonstration about calculating the area under graphs.');
  });
});
