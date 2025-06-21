import fs from 'fs';
import path from 'path';
import { parseWorksheetMarkdown } from './worksheetMarkdownParser.js';
import { generateWorksheetPageContent } from './worksheetPageGenerator.js';
import { fileURLToPath } from 'url';

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function updateWorksheetsSection(title, slug) {
  const worksheetsSectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'components', 'WorksheetsSection.tsx');
  
  // For now, we'll just log that we would update the section
  // In a full implementation, we could modify the WorksheetsSection component
  // or update a data file that it reads from
  console.warn(`Note: New worksheet "${title}" with slug "${slug}" ready to be added to WorksheetsSection`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const forceOverwrite = args.includes('--force');
const mdPath = args.find(arg => !arg.startsWith('--')) || path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'content', 'worksheet_sources', 'worksheets.md');

if (forceOverwrite) {
  console.warn('Force overwrite mode enabled - all PDFs will be copied regardless of modification time');
}
const markdown = fs.readFileSync(mdPath, 'utf-8');
const entries = parseWorksheetMarkdown(markdown);

for (const entry of entries) {
  // 1. Create worksheet directory
  const worksheetDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'content', 'worksheets', entry.slug);
  if (!fs.existsSync(worksheetDir)) {
    fs.mkdirSync(worksheetDir, { recursive: true });
  }
  
  // 2. Create public worksheet directory and copy PDFs
  const publicWorksheetDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'worksheets', entry.slug);
  if (!fs.existsSync(publicWorksheetDir)) {
    fs.mkdirSync(publicWorksheetDir, { recursive: true });
  }
  
  // Copy all PDF files from content directory to public directory
  if (fs.existsSync(worksheetDir)) {
    const files = fs.readdirSync(worksheetDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    for (const pdfFile of pdfFiles) {
      const sourcePath = path.join(worksheetDir, pdfFile);
      const destPath = path.join(publicWorksheetDir, pdfFile);
      
      try {
        let shouldCopy = true;
        let reason = 'new file';
        
        // Check if destination file exists and compare modification times
        if (fs.existsSync(destPath)) {
          const sourceStats = fs.statSync(sourcePath);
          const destStats = fs.statSync(destPath);
          
          if (!forceOverwrite && sourceStats.mtime <= destStats.mtime) {
            shouldCopy = false;
            reason = 'destination is newer or same';
          } else {
            reason = forceOverwrite ? 'force overwrite' : 'source is newer';
          }
        }
        
        if (shouldCopy) {
          fs.copyFileSync(sourcePath, destPath);
          console.warn(`Copied PDF: ${pdfFile} → public/worksheets/${entry.slug}/ (${reason})`);
        } else {
          console.warn(`Skipped PDF: ${pdfFile} (${reason})`);
        }
      } catch (error) {
        console.warn(`Warning: Could not copy ${pdfFile}:`, error.message);
      }
    }
  }
  
  // 3. Generate and write index.md
  const pageContent = generateWorksheetPageContent(entry);
  fs.writeFileSync(path.join(worksheetDir, 'index.md'), pageContent, 'utf-8');
  console.warn(`Generated: ${path.join('content', 'worksheets', entry.slug, 'index.md')}`);
  
  // 4. Note about updating WorksheetsSection
  updateWorksheetsSection(entry.title, entry.slug);
}

console.warn('All worksheet pages generated.');
console.warn('Note: The WorksheetsSection component will automatically pick up new worksheets from the content/worksheets directory.');
