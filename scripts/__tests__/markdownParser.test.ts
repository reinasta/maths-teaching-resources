import { parseVideoMarkdown } from '../markdownParser';
import fs from 'fs';
import path from 'path';

describe('parseVideoMarkdown', () => {
  it('extracts video entries from markdown', () => {
    const mdPath = path.join(__dirname, 'fixtures', 'videos.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    const result = parseVideoMarkdown(markdown);
    expect(result).toEqual([
      {
        componentName: 'AreaUnderGraphs',
        videoFile: 'AreaUnderGraphsScene.mp4',
        videoPath: 'videos/components/AreaUnderGraphsScene.mp4',
        description: 'Video demonstration about calculating the area under graphs.'
      },
      {
        componentName: 'Enlargement',
        videoFile: 'EnlargementScene.mp4',
        videoPath: 'videos/components/EnlargementScene.mp4',
        description: 'Video about enlargement transformations in geometry.'
      }
    ]);
  });
});
