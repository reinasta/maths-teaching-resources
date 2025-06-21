import fs from 'fs';
import path from 'path';
import { parseWorksheetMarkdown } from '../worksheetMarkdownParser';
import { generateWorksheetPageContent } from '../worksheetPageGenerator';

describe('Worksheet Generation Integration', () => {
  const testFixturePath = path.join(__dirname, 'fixtures', 'worksheets.md');
  const testFixture = `# Math Worksheets

## Linear Equations
**Description:** Solve linear equations in one variable using various algebraic methods.
**Worksheet PDF:** /worksheets/linear-equations/worksheet.pdf
**Answers PDF:** /worksheets/linear-equations/answers.pdf
**Additional Links:**
- [Equation Solver](https://www.mathpapa.com/algebra-calculator.html)
**Tags:** algebra, linear, equations

## Geometry Basics
**Description:** Introduction to basic geometric shapes, angles, and area calculations.
**Worksheet PDF:** /worksheets/geometry-basics/worksheet.pdf
**Answers PDF:** /worksheets/geometry-basics/answers.pdf
**Tags:** geometry, shapes, area, angles`;

  beforeAll(() => {
    // Create fixtures directory if it doesn't exist
    const fixturesDir = path.dirname(testFixturePath);
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // Write test fixture
    fs.writeFileSync(testFixturePath, testFixture, 'utf-8');
  });

  afterAll(() => {
    // Clean up test fixture
    if (fs.existsSync(testFixturePath)) {
      fs.unlinkSync(testFixturePath);
    }
  });

  it('should parse markdown and generate worksheet pages for all entries', () => {
    const markdown = fs.readFileSync(testFixturePath, 'utf-8');
    const entries = parseWorksheetMarkdown(markdown);
    
    expect(entries).toHaveLength(2);
    
    // Test that we can generate content for each entry
    entries.forEach(entry => {
      const content = generateWorksheetPageContent(entry);
      
      // Check that the content has the required sections
      expect(content).toContain('---'); // Frontmatter
      expect(content).toContain('## Worksheet Overview');
      expect(content).toContain('## Learning Objectives');
      expect(content).toContain('## Prerequisites');
      expect(content).toContain('## Instructions');
      expect(content).toContain('## Downloads');
      
      // Check that the content includes the entry data
      expect(content).toContain(entry.title);
      expect(content).toContain(entry.description);
      expect(content).toContain(entry.worksheetPdf);
      expect(content).toContain(entry.answersPdf);
    });
  });

  it('should create proper slugs that can be used as directory names', () => {
    const markdown = fs.readFileSync(testFixturePath, 'utf-8');
    const entries = parseWorksheetMarkdown(markdown);
    
    entries.forEach(entry => {
      // Test that slug is valid for file system
      expect(entry.slug).toMatch(/^[a-z0-9-]+$/);
      expect(entry.slug).not.toContain(' ');
      expect(entry.slug).not.toContain('_');
      expect(entry.slug.startsWith('-')).toBe(false);
      expect(entry.slug.endsWith('-')).toBe(false);
    });
  });

  it('should generate content with proper frontmatter format', () => {
    const markdown = fs.readFileSync(testFixturePath, 'utf-8');
    const entries = parseWorksheetMarkdown(markdown);
    
    entries.forEach(entry => {
      const content = generateWorksheetPageContent(entry);
      
      // Check frontmatter starts and ends correctly
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/\n---\n/);
      
      // Check required frontmatter fields are present
      expect(content).toContain(`title: "${entry.title}"`);
      expect(content).toContain(`slug: "${entry.slug}"`);
      expect(content).toContain('date: ');
    });
  });
});
