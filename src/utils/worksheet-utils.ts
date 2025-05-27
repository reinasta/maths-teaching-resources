import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface WorksheetFrontmatter {
  title: string;
  description: string;
  worksheetPdf: string;
  answersPdf: string;
  date: string;
  tags?: string[];
  slug: string;
}

export interface WorksheetData {
  frontmatter: WorksheetFrontmatter;
  content: string;
  slug: string;
}

const worksheetsDirectory = path.join(process.cwd(), 'content/worksheets');

/**
 * Returns an array of worksheet slugs from the content/worksheets directory
 */
export function getWorksheetSlugs(): { slug: string }[] {
  try {
    if (!fs.existsSync(worksheetsDirectory)) {
      return [];
    }
    
    const slugs = fs.readdirSync(worksheetsDirectory);
    return slugs
      .filter((slug) => {
        const slugPath = path.join(worksheetsDirectory, slug);
        return fs.statSync(slugPath).isDirectory();
      })
      .map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error reading worksheet slugs:', error);
    return [];
  }
}

/**
 * Reads and processes a worksheet markdown file by slug
 */
export function getWorksheetDataBySlug(slug: string): WorksheetData | null {
  try {
    if (!slug) {
      console.error('Slug is undefined or empty');
      return null;
    }
    
    const fullPath = path.join(worksheetsDirectory, slug, 'index.md');
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Ensure required frontmatter fields exist
    const frontmatter: WorksheetFrontmatter = {
      title: data.title || 'Untitled Worksheet',
      description: data.description || '',
      worksheetPdf: data.worksheetPdf || '',
      answersPdf: data.answersPdf || '',
      date: data.date || new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      slug: data.slug || slug,
    };
    
    return {
      frontmatter,
      content,
      slug,
    };
  } catch (error) {
    console.error(`Error reading worksheet data for slug "${slug}":`, error);
    return null;
  }
}

/**
 * Retrieves data for all worksheets, sorted by date (newest first)
 */
export function getAllWorksheetsData(): WorksheetData[] {
  try {
    const slugs = getWorksheetSlugs();
    const worksheetsData: WorksheetData[] = [];
    
    for (const { slug } of slugs) {
      const data = getWorksheetDataBySlug(slug);
      if (data) {
        worksheetsData.push(data);
      }
    }
    
    // Sort by date (newest first)
    return worksheetsData.sort((a, b) => {
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
    });
  } catch (error) {
    console.error('Error getting all worksheets data:', error);
    return [];
  }
}
