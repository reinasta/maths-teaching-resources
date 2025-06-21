import fs from 'fs';
import { parseWorksheetMarkdown } from './scripts/worksheetMarkdownParser.js';

const content = fs.readFileSync('content/worksheet_sources/worksheets.md', 'utf8');
const entries = parseWorksheetMarkdown(content);
const elevationsEntry = entries.find(e => e.slug === '3d-solids-drawing-from-elevations');

console.log('Elevations Entry:');
console.log('Additional Links:', elevationsEntry.additionalLinks);
console.log('Additional Resources:', elevationsEntry.additionalResources);
console.log('All entries:', entries.map(e => ({ title: e.title, additionalLinks: e.additionalLinks, additionalResources: e.additionalResources })));
