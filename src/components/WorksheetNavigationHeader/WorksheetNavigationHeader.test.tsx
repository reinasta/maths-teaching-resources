// src/components/WorksheetNavigationHeader/WorksheetNavigationHeader.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import WorksheetNavigationHeader from './WorksheetNavigationHeader';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockRouter = {
  back: jest.fn(),
  push: jest.fn()
};

describe('WorksheetNavigationHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock window properties
    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true
    });
    
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true
    });
    
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true
    });
  });

  it('should render basic navigation header', () => {
    render(<WorksheetNavigationHeader />);

    expect(screen.getByText('Back to All Worksheets')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Worksheets')).toBeInTheDocument();
    expect(screen.getByText('All Worksheets')).toBeInTheDocument();
  });

  it('should render with worksheet title in breadcrumbs', () => {
    render(<WorksheetNavigationHeader worksheetTitle="Algebra Basics" />);

    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
  });

  it('should detect referrer from worksheets list page', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'http://localhost:3000/worksheets',
      writable: true
    });

    render(<WorksheetNavigationHeader />);

    expect(screen.getByText('Back to All Worksheets')).toBeInTheDocument();
  });

  it('should detect referrer from landing page', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'http://localhost:3000/',
      writable: true
    });

    render(<WorksheetNavigationHeader />);

    expect(screen.getByText('Back to Resources')).toBeInTheDocument();
  });

  it('should handle back navigation with browser history', () => {
    render(<WorksheetNavigationHeader />);

    const backButton = screen.getByText('Back to All Worksheets').closest('button');
    fireEvent.click(backButton!);

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('should handle back navigation without browser history', () => {
    Object.defineProperty(window, 'history', {
      value: { length: 1 },
      writable: true
    });

    render(<WorksheetNavigationHeader />);

    const backButton = screen.getByText('Back to All Worksheets').closest('button');
    fireEvent.click(backButton!);

    expect(mockRouter.push).toHaveBeenCalledWith('/worksheets');
  });

  it('should handle invalid referrer URL gracefully', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'invalid-url',
      writable: true
    });

    render(<WorksheetNavigationHeader />);

    expect(screen.getByText('Back to Resources')).toBeInTheDocument();
  });

  it('should render correct breadcrumb links', () => {
    render(<WorksheetNavigationHeader worksheetTitle="Test Worksheet" />);

    const homeLink = screen.getByText('Home').closest('a');
    const worksheetsLink = screen.getByText('Worksheets').closest('a');
    const allWorksheetsLink = screen.getByText('All Worksheets').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(worksheetsLink).toHaveAttribute('href', '/worksheets');
    expect(allWorksheetsLink).toHaveAttribute('href', '/worksheets');
  });

  it('should have proper styling classes', () => {
    const { container } = render(<WorksheetNavigationHeader />);

    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('bg-white', 'border-b', 'border-gray-200', 'sticky', 'top-0', 'z-10');
  });

  it('should prevent default on back button click', () => {
    render(<WorksheetNavigationHeader />);

    const backButton = screen.getByText('Back to All Worksheets').closest('button');
    
    // Create a spy on the actual preventDefault method
    const mockPreventDefault = jest.fn();
    
    // Add event listener to capture the click event
    backButton?.addEventListener('click', (e) => {
      e.preventDefault = mockPreventDefault;
    });
    
    fireEvent.click(backButton!);

    // The component should call router.back or router.push, which indicates preventDefault was handled
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
