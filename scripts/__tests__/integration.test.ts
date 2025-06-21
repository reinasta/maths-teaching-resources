import fs from 'fs';
import path from 'path';
import { parseVideoMarkdown } from '../markdownParser';
import { generateComponentFiles } from '../componentGenerator';
import { generateStandalonePage } from '../standalonePageGenerator';
import { generateLandingPageLink } from '../landingPageLinkGenerator';

describe('Video Component Integration', () => {
  it('parses markdown and generates all required files for each entry', () => {
    const mdPath = path.join(__dirname, 'fixtures', 'videos.md');
    const markdown = fs.readFileSync(mdPath, 'utf-8');
    const entries = parseVideoMarkdown(markdown);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      // Component files
      const files = generateComponentFiles(entry);
      expect(files[`${entry.componentName}.tsx`]).toContain('<video');
      expect(files[`${entry.componentName}.tsx`]).toContain(entry.videoPath);
      expect(files[`${entry.componentName}.tsx`]).toContain(entry.componentName.replace(/([A-Z])/g, ' $1').trim());
      expect(files['index.tsx']).toContain('export { default } from');
      // Standalone page
      const page = generateStandalonePage(entry);
      expect(page).toContain('StandaloneLayout');
      expect(page).toContain(entry.componentName);
      expect(page).toContain(entry.description);
      // Landing page link
      const link = generateLandingPageLink(entry);
      expect(link).toContain(`/components/standalone/${entry.componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`);
      expect(link).toContain(entry.description);
    }
  });
});
