import fs from 'fs';
import path from 'path';
import { generateLandingPageLink } from '../landingPageLinkGenerator.js';

// Improved updateLandingPage function: robust to whitespace/formatting
function updateLandingPage(page, linkBlock, href) {
  const gridStart = page.indexOf('<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">');
  if (gridStart === -1) throw new Error('Interactive Tools grid not found');
  const gridEnd = page.indexOf('</div>', gridStart);
  if (gridEnd === -1) throw new Error('End of Interactive Tools grid not found');
  // More robust regex: allow whitespace, attributes in any order, and line breaks
  const linkRegex = new RegExp(`<Link[^>]*href=(["'])${href}\\1[\\s\\S]*?<\/Link>`, 'gi');
  let gridContent = page.slice(gridStart, gridEnd);
  if (linkRegex.test(gridContent)) {
    gridContent = gridContent.replace(linkRegex, linkBlock);
  } else {
    gridContent = gridContent + '\n' + linkBlock + '\n';
  }
  return page.slice(0, gridStart) + gridContent + page.slice(gridEnd);
}

describe('Landing page link update', () => {
  const landingPath = path.join(__dirname, '../../src/app/page.tsx');
  const href = '/components/standalone/area-under-graphs';
  const linkBlock = generateLandingPageLink({
    componentName: 'AreaUnderGraphs',
    videoFile: 'AreaUnderGraphsScene.mp4',
    videoPath: 'videos/components/AreaUnderGraphsScene.mp4',
    description: 'Video demonstration about calculating the area under graphs.'
  });
  let original;

  beforeAll(() => {
    original = fs.readFileSync(landingPath, 'utf-8');
  });
  afterAll(() => {
    fs.writeFileSync(landingPath, original, 'utf-8');
  });

  it('does not duplicate links when run twice', () => {
    let page = original;
    // First run: insert or replace
    page = updateLandingPage(page, linkBlock, href);
    // Second run: should replace, not duplicate
    page = updateLandingPage(page, linkBlock, href);
    // Extract the grid section for debugging
    const gridStart = page.indexOf('<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">');
    const gridEnd = page.indexOf('</div>', gridStart);
    const gridContent = page.slice(gridStart, gridEnd);
    // Debug output
    console.log('---GRID CONTENT---\n', gridContent, '\n---END GRID---');
    // Improved regex: match <Link ... href="..."> with any whitespace/attributes/line breaks
    const linkBlockRegex = new RegExp(`<Link[^>]*href=(["'])${href}\\1[\\s\\S]*?<\/Link>`, 'gi');
    const matches = gridContent.match(linkBlockRegex) || [];
    expect(matches.length).toBe(1);
  });
});
