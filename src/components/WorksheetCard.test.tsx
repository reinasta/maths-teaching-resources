// src/components/WorksheetCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import WorksheetCard from './WorksheetCard';
import { WorksheetFrontmatter } from '@/utils/worksheet-utils';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('WorksheetCard', () => {
  const mockFrontmatter: WorksheetFrontmatter = {
    title: 'Algebra Basics',
    description: 'Introduction to basic algebraic concepts including variables, expressions, and simple equations.',
    worksheetPdf: '/worksheets/algebra-basics/worksheet.pdf',
    answersPdf: '/worksheets/algebra-basics/answers.pdf',
    date: '2024-05-20',
    tags: ['algebra', 'basics', 'variables'],
    slug: 'algebra-basics'
  };

  it('should render worksheet card with all content', () => {
    render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={mockFrontmatter} 
      />
    );

    // Check title
    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText(/Introduction to basic algebraic concepts/)).toBeInTheDocument();
    
    // Check PDF download links
    expect(screen.getByText('📄 Download Worksheet')).toBeInTheDocument();
    expect(screen.getByText('✅ Download Answers')).toBeInTheDocument();
    
    // Check see more link
    expect(screen.getByText('See more details →')).toBeInTheDocument();
  });

  it('should render correct PDF download links', () => {
    render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={mockFrontmatter} 
      />
    );

    const worksheetLink = screen.getByText('📄 Download Worksheet').closest('a');
    const answersLink = screen.getByText('✅ Download Answers').closest('a');

    expect(worksheetLink).toHaveAttribute('href', '/worksheets/algebra-basics/worksheet.pdf');
    expect(answersLink).toHaveAttribute('href', '/worksheets/algebra-basics/answers.pdf');
    
    // Check that links open in new tab
    expect(worksheetLink).toHaveAttribute('target', '_blank');
    expect(answersLink).toHaveAttribute('target', '_blank');
    expect(worksheetLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(answersLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render tags correctly', () => {
    render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={mockFrontmatter} 
      />
    );

    // Should show first 2 tags
    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('basics')).toBeInTheDocument();
    
    // Should show +1 indicator for additional tags
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('should render without tags when none provided', () => {
    const frontmatterWithoutTags = { ...mockFrontmatter, tags: undefined };
    
    render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={frontmatterWithoutTags} 
      />
    );

    expect(screen.queryByText('algebra')).not.toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('should handle missing PDF links gracefully', () => {
    const frontmatterWithoutPdfs = {
      ...mockFrontmatter,
      worksheetPdf: '',
      answersPdf: ''
    };
    
    render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={frontmatterWithoutPdfs} 
      />
    );

    expect(screen.queryByText('📄 Download Worksheet')).not.toBeInTheDocument();
    expect(screen.queryByText('✅ Download Answers')).not.toBeInTheDocument();
  });

  it('should render correct "see more" link', () => {
    render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={mockFrontmatter} 
      />
    );

    const seeMoreLink = screen.getByText('See more details →').closest('a');
    expect(seeMoreLink).toHaveAttribute('href', '/worksheets/algebra-basics');
  });

  it('should have proper styling classes', () => {
    const { container } = render(
      <WorksheetCard 
        slug="algebra-basics" 
        frontmatter={mockFrontmatter} 
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'hover:shadow-lg');
  });
});
