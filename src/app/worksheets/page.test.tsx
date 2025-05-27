// src/app/worksheets/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import WorksheetsPage from './page';
import * as worksheetUtils from '@/utils/worksheet-utils';

// Mock the worksheet utils
jest.mock('@/utils/worksheet-utils');
const mockWorksheetUtils = worksheetUtils as jest.Mocked<typeof worksheetUtils>;

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('WorksheetsPage', () => {
  const mockWorksheets = [
    {
      slug: 'algebra-basics',
      frontmatter: {
        title: 'Algebra Basics',
        description: 'Introduction to basic algebraic concepts including variables, expressions, and simple equations.',
        worksheetPdf: '/worksheets/algebra-basics/worksheet.pdf',
        answersPdf: '/worksheets/algebra-basics/answers.pdf',
        date: '2024-05-20',
        tags: ['algebra', 'basics', 'variables'],
        slug: 'algebra-basics'
      },
      content: 'Content 1'
    },
    {
      slug: 'geometry-shapes',
      frontmatter: {
        title: 'Geometry Shapes',
        description: 'Learning about different geometric shapes and their properties.',
        worksheetPdf: '/worksheets/geometry-shapes/worksheet.pdf',
        answersPdf: '/worksheets/geometry-shapes/answers.pdf',
        date: '2024-05-15',
        tags: ['geometry', 'shapes'],
        slug: 'geometry-shapes'
      },
      content: 'Content 2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render page header correctly', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    expect(screen.getByText('Maths Worksheets')).toBeInTheDocument();
    expect(screen.getByText(/Download and print our collection/)).toBeInTheDocument();
  });

  it('should render all worksheets in grid layout', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    // Check worksheet titles
    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    expect(screen.getByText('Geometry Shapes')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText(/Introduction to basic algebraic concepts/)).toBeInTheDocument();
    expect(screen.getByText(/Learning about different geometric shapes/)).toBeInTheDocument();
  });

  it('should render PDF download links for each worksheet', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    // Should have download buttons for each worksheet
    const worksheetButtons = screen.getAllByText('📄 Download Worksheet');
    const answerButtons = screen.getAllByText('✅ Download Answers');

    expect(worksheetButtons).toHaveLength(2);
    expect(answerButtons).toHaveLength(2);

    // Check specific PDF links
    const firstWorksheetLink = worksheetButtons[0].closest('a');
    expect(firstWorksheetLink).toHaveAttribute('href', '/worksheets/algebra-basics/worksheet.pdf');
    expect(firstWorksheetLink).toHaveAttribute('target', '_blank');
  });

  it('should render tags for each worksheet', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    // Check for tags
    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('basics')).toBeInTheDocument();
    expect(screen.getByText('geometry')).toBeInTheDocument();
    expect(screen.getByText('shapes')).toBeInTheDocument();
  });

  it('should limit displayed tags to 3 and show counter for more', () => {
    const worksheetWithManyTags = {
      ...mockWorksheets[0],
      frontmatter: {
        ...mockWorksheets[0].frontmatter,
        tags: ['algebra', 'basics', 'variables', 'equations', 'math']
      }
    };

    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue([worksheetWithManyTags]);

    render(<WorksheetsPage />);

    // Should show first 3 tags
    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('basics')).toBeInTheDocument();
    expect(screen.getByText('variables')).toBeInTheDocument();

    // Should show +2 more indicator
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should render "see more details" links', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    const seeMoreLinks = screen.getAllByText('See more details →');
    expect(seeMoreLinks).toHaveLength(2);

    const firstLink = seeMoreLinks[0].closest('a');
    expect(firstLink).toHaveAttribute('href', '/worksheets/algebra-basics');
  });

  it('should display formatted dates correctly', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    expect(screen.getByText(/Updated: 5\/20\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/Updated: 5\/15\/2024/)).toBeInTheDocument();
  });

  it('should render back to home link', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue(mockWorksheets);

    render(<WorksheetsPage />);

    const backLink = screen.getByText('← Back to home').closest('a');
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('should show empty state when no worksheets available', () => {
    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue([]);

    render(<WorksheetsPage />);

    expect(screen.getByText('No worksheets available yet.')).toBeInTheDocument();
    expect(screen.queryByText('Algebra Basics')).not.toBeInTheDocument();
  });

  it('should handle worksheets without tags gracefully', () => {
    const worksheetWithoutTags = {
      ...mockWorksheets[0],
      frontmatter: {
        ...mockWorksheets[0].frontmatter,
        tags: undefined
      }
    };

    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue([worksheetWithoutTags]);

    render(<WorksheetsPage />);

    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    expect(screen.queryByText('algebra')).not.toBeInTheDocument();
  });

  it('should handle missing PDF links gracefully', () => {
    const worksheetWithoutPdfs = {
      ...mockWorksheets[0],
      frontmatter: {
        ...mockWorksheets[0].frontmatter,
        worksheetPdf: '',
        answersPdf: ''
      }
    };

    mockWorksheetUtils.getAllWorksheetsData.mockReturnValue([worksheetWithoutPdfs]);

    render(<WorksheetsPage />);

    expect(screen.queryByText('📄 Download Worksheet')).not.toBeInTheDocument();
    expect(screen.queryByText('✅ Download Answers')).not.toBeInTheDocument();
  });
});
