import fs from 'fs';
import path from 'path';
import { parseVideoMarkdown } from './markdownParser.js';
import { generateComponentFiles } from './componentGenerator.js';
import { generateStandalonePage } from './standalonePageGenerator.js';
import { generateLandingPageLink } from './landingPageLinkGenerator.js';
import { fileURLToPath } from 'url';

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const mdPath = process.argv[2] || path.join(path.dirname(new URL(import.meta.url).pathname), '__tests__', 'fixtures', 'videos.md');
const markdown = fs.readFileSync(mdPath, 'utf-8');
const entries = parseVideoMarkdown(markdown);

function updateLandingPage(linkBlock, href) {
  const landingPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'page.tsx');
  const page = fs.readFileSync(landingPath, 'utf-8');

  // Find the Interactive Tools section grid
  const gridStartMarker = '<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">';
  const gridStart = page.indexOf(gridStartMarker);
  if (gridStart === -1) throw new Error('Interactive Tools grid not found');
  
  const gridContentStart = gridStart + gridStartMarker.length;
  const gridEnd = page.indexOf('</div>', gridContentStart);
  if (gridEnd === -1) throw new Error('End of Interactive Tools grid not found');

  let gridContent = page.slice(gridContentStart, gridEnd);
  
  // Build a regex to match the specific Link block for this href
  const linkRegex = new RegExp(
    `\\s*<Link[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?</Link>`,
    'g'
  );
  
  // Remove any existing links with this href
  const beforeRemoval = gridContent;
  gridContent = gridContent.replace(linkRegex, '');
  
  // Add the new link block (with proper indentation)
  gridContent = gridContent + '\n              ' + linkBlock;
  
  // Reconstruct the page
  const newPage = page.slice(0, gridContentStart) + gridContent + page.slice(gridEnd);
  fs.writeFileSync(landingPath, newPage, 'utf-8');
  
  const wasUpdated = beforeRemoval !== gridContent.replace('\n              ' + linkBlock, '');
  console.warn(`Landing page ${wasUpdated ? 'updated' : 'added link'} for ${href}`);
}

for (const entry of entries) {
  // 1. Write React component and index file
  const componentDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'components', entry.componentName);
  if (!fs.existsSync(componentDir)) fs.mkdirSync(componentDir, { recursive: true });
  const files = generateComponentFiles(entry);
  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(componentDir, filename), content, 'utf-8');
    console.warn(`Generated: ${path.join('src', 'components', entry.componentName, filename)}`);
  }

  // 2. Write standalone page
  const kebabName = toKebabCase(entry.componentName);
  const standaloneDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'app', 'components', 'standalone', kebabName);
  if (!fs.existsSync(standaloneDir)) fs.mkdirSync(standaloneDir, { recursive: true });
  const pageContent = generateStandalonePage(entry);
  fs.writeFileSync(path.join(standaloneDir, 'page.tsx'), pageContent, 'utf-8');
  console.warn(`Generated: ${path.join('src', 'app', 'components', 'standalone', kebabName, 'page.tsx')}`);

  // 3. Output landing page link block
  const linkBlock = generateLandingPageLink(entry);
  const href = `/components/standalone/${toKebabCase(entry.componentName)}`;
  updateLandingPage(linkBlock, href);
}

console.warn('All video components and pages generated.');
