// src/app/api/components/[name]/route.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

// This is a server component that can use fs
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const { name } = params;
  
  try {
    // Get the content directory path
    const contentDir = path.join(process.cwd(), 'content/components');
    const filePath = path.join(contentDir, `${name}.md`);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Component ${name} not found` },
        { status: 404 }
      );
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    return NextResponse.json({
      frontmatter: data,
      content
    });
    
  } catch (error) {
    console.error(`Error loading component ${name}:`, error);
    return NextResponse.json(
      { error: 'Failed to load component data' },
      { status: 500 }
    );
  }
}