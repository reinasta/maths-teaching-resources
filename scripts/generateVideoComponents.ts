import fs from 'fs';
import path from 'path';
import { parseVideoMarkdown } from './markdownParser';
import { generateComponentFiles } from './componentGenerator';
import { generateStandalonePage } from './standalonePageGenerator';
import { generateLandingPageLink } from './landingPageLinkGenerator';

function toKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const mdPath = process.argv[2] || path.join(__dirname, '__tests__', 'fixtures', 'videos.md');
const markdown = fs.readFileSync(mdPath, 'utf-8');
const entries = parseVideoMarkdown(markdown);

for (const entry of entries) {
  // 1. Write React component and index file
  const componentDir = path.join(__dirname, '..', 'src', 'components', entry.componentName);
  if (!fs.existsSync(componentDir)) fs.mkdirSync(componentDir, { recursive: true });
  const files = generateComponentFiles(entry);
  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(componentDir, filename), content, 'utf-8');
    console.log(`Generated: ${path.join('src', 'components', entry.componentName, filename)}`);
  }

  // 2. Write standalone page
  const kebabName = toKebabCase(entry.componentName);
  const standaloneDir = path.join(__dirname, '..', 'src', 'app', 'components', 'standalone', kebabName);
  if (!fs.existsSync(standaloneDir)) fs.mkdirSync(standaloneDir, { recursive: true });
  const pageContent = generateStandalonePage(entry);
  fs.writeFileSync(path.join(standaloneDir, 'page.tsx'), pageContent, 'utf-8');
  console.log(`Generated: ${path.join('src', 'app', 'components', 'standalone', kebabName, 'page.tsx')}`);

  // 3. Output landing page link block
  const linkBlock = generateLandingPageLink(entry);
  console.log('\n--- Landing Page Link Block ---\n');
  console.log(linkBlock);
  console.log('\n------------------------------\n');
}

console.log('All video components and pages generated.');
