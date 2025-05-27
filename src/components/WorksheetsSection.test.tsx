// src/components/WorksheetsSection.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import WorksheetsSection from './WorksheetsSection';
import * as worksheetUtils from '@/utils/worksheet-utils';

// Mock the worksheet utils
jest.mock('@/utils/worksheet-utils');
const mockWorksheetUtils = worksheetUtils as jest.Mocked<typeof worksheetUtils>;

// Mock WorksheetCard component
jest.mock('./WorksheetCard', () => {
  return function MockWorksheetCard({ slug, frontmatter }: { slug: string; frontmatter: { title: string } }) {
    return (
      <div data-testid={`worksheet-card-${slug}`}>
        {frontmatter.title}
      </div>
    );
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('WorksheetsSection', () => {
  const mockWorksheets = [
    {
      slug: 'algebra-basics',
      frontmatter: {
        title: 'Algebra Basics',
        description: 'Basic algebra concepts',
        worksheetPdf: '/worksheets/algebra-basics/worksheet.pdf',
        answersPdf: '/worksheets/algebra-basics/answers.pdf',
        date: '2024-05-25',
        tags: ['algebra'],
        slug: 'algebra-basics'
      },
      content: 'Content 1'
    },
    {
      slug: 'geometry-shapes',
      frontmatter: {
        title: 'Geometry Shapes',
        description: 'Learning about shapes',
        worksheetPdf: '/worksheets/geometry-shapes/worksheet.pdf',
        answersPdf: '/worksheets/geometry-shapes/answers.pdf',
        date: '2024-05-20',
        tags: ['geometry'],
        slug: 'geometry-shapes'
      },
      content: 'Content 2'
    },
    {
      slug: 'fractions-decimals',
      frontmatter: {
        title: 'Fractions & Decimals',
        description: 'Working with fractions',
        worksheetPdf: '/worksheets/fractions-decimals/worksheet.pdf',
        answersPdf: '/worksheets/fractions-decimals/answers.pdf',
        date: '2024-05-15',
        tags: ['fractions'],
        slug: 'fractions-decimals'
      },
      content: 'Content 3'
    },
    {
      slug: 'laws-of-indices',
      frontmatter: {
        title: 'Laws of Indices',
        description: 'Understanding indices',
        worksheetPdf: '/worksheets/laws-of-indices/worksheet.pdf',
        answersPdf: '/worksheets/laws-of-indices/answers.pdf',
        date: '2024-05-10',
        tags: ['indices'],
        slug: 'laws-of-indices'
      },
      content: 'Content 4'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render worksheets section with recent worksheets', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsSection />);

    // Check section title and description
    expect(screen.getByText('Maths Worksheets')).toBeInTheDocument();
    expect(screen.getByText(/Download printable worksheets/)).toBeInTheDocument();

    // Should only show first 3 worksheets (most recent)
    expect(screen.getByTestId('worksheet-card-algebra-basics')).toBeInTheDocument();
    expect(screen.getByTestId('worksheet-card-geometry-shapes')).toBeInTheDocument();
    expect(screen.getByTestId('worksheet-card-fractions-decimals')).toBeInTheDocument();
    
    // Should not show the 4th worksheet
    expect(screen.queryByTestId('worksheet-card-laws-of-indices')).not.toBeInTheDocument();

    // Check "View all worksheets" link
    const viewAllLink = screen.getByText('View all worksheets →').closest('a');
    expect(viewAllLink).toHaveAttribute('href', '/worksheets');
  });

  it('should not render section when no worksheets available', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue([]);

    const { container } = render(<WorksheetsSection />);

    expect(container.firstChild).toBeNull();
  });

  it('should handle fewer than 3 worksheets correctly', () => {
    const twoWorksheets = mockWorksheets.slice(0, 2);
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(twoWorksheets);

    render(<WorksheetsSection />);

    expect(screen.getByTestId('worksheet-card-algebra-basics')).toBeInTheDocument();
    expect(screen.getByTestId('worksheet-card-geometry-shapes')).toBeInTheDocument();
    expect(screen.queryByTestId('worksheet-card-fractions-decimals')).not.toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    const { container } = render(<WorksheetsSection />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('col-span-full');
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-6', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should call getAllWorksheetsData once', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsSection />);

    expect(mockWorksheetUtils.getAllWorksheetsData).toHaveBeenCalledTimes(1);
  });
});
