"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
//import matter from 'gray-matter';
// Define directories
const CONTENT_DIR = path_1.default.join(process.cwd(), 'content/components');
const PAGES_OUTPUT_DIR = path_1.default.join(process.cwd(), 'src/app/components/standalone');
// Custom component for videos (for MDX)
const VIDEO_COMPONENT = `
import React from 'react';

export function Video({ src, type = 'video/mp4' }) {
  return (
    <video 
      controls
      className="w-full rounded-lg shadow-lg"
      preload="metadata"
      playsInline
    >
      <source src={src} type={type} />
      Your browser does not support the video tag.
    </video>
  );
}
`;
// Create a template page
function createPageTemplate(componentName) {
    const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    return `'use client';

import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import StandaloneLayout from '@/components/StandaloneLayout';
import { getComponentData } from '@/utils/mdx-utils';
import { Video } from '@/components/Video';
import { useState, useEffect } from 'react';

// Define custom components for MDX
const components = {
  Video
};

export default function ${pascalCaseName}Page() {
  const [mdxSource, setMdxSource] = useState(null);
  const [frontmatter, setFrontmatter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const { frontmatter, content } = await getComponentData('${componentName}');
        const mdxSource = await serialize(content);
        setMdxSource(mdxSource);
        setFrontmatter(frontmatter);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadContent();
  }, []);
  
  if (loading) {
    return (
      <StandaloneLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </StandaloneLayout>
    );
  }
  
  if (error) {
    return (
      <StandaloneLayout>
        <div className="text-red-500">{error}</div>
      </StandaloneLayout>
    );
  }
  
  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">{frontmatter.title || '${pascalCaseName}'}</h1>
      <p className="mb-8">{frontmatter.description || ''}</p>
      
      {mdxSource && <MDXRemote {...mdxSource} components={components} />}
    </StandaloneLayout>
  );
}`;
}
function generateComponentPages() {
    // Create the Video component
    const componentsDir = path_1.default.join(process.cwd(), 'src/components');
    fs_1.default.writeFileSync(path_1.default.join(componentsDir, 'Video.tsx'), VIDEO_COMPONENT);
    // Get all markdown files
    const files = fs_1.default.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md'));
    files.forEach(file => {
        const componentName = path_1.default.basename(file, '.md');
        // Create page directory
        const pageDir = path_1.default.join(PAGES_OUTPUT_DIR, componentName);
        fs_1.default.mkdirSync(pageDir, { recursive: true });
        // Create page file
        const pageContent = createPageTemplate(componentName);
        fs_1.default.writeFileSync(path_1.default.join(pageDir, 'page.tsx'), pageContent);
        console.log(`Generated page for ${componentName}`);
    });
}
// Run the script
generateComponentPages();
