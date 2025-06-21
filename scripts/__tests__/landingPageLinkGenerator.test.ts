import { generateLandingPageLink } from '../landingPageLinkGenerator';
import { VideoEntry } from '../markdownParser';

describe('generateLandingPageLink', () => {
  it('generates a landing page link block for the video component', () => {
    const entry: VideoEntry = {
      componentName: 'AreaUnderGraphs',
      videoFile: 'AreaUnderGraphsScene.mp4',
      videoPath: 'videos/components/AreaUnderGraphsScene.mp4',
      description: 'Video demonstration about calculating the area under graphs.'
    };
    const link = generateLandingPageLink(entry);
    expect(link).toContain('href="/components/standalone/area-under-graphs"');
    expect(link).toContain('Area Under Graphs');
    expect(link).toContain('Video demonstration about calculating the area under graphs.');
  });
});
