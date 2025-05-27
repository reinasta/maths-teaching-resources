'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WorksheetNavigationHeaderProps {
  worksheetTitle?: string;
}

export default function WorksheetNavigationHeader({ worksheetTitle }: WorksheetNavigationHeaderProps) {
  const router = useRouter();
  const [backUrl, setBackUrl] = useState('/');
  const [backLabel, setBackLabel] = useState('Back to Resources');

  useEffect(() => {
    // Check if there's a previous page in browser history
    const referrer = document.referrer;
    
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;
        
        // If coming from the worksheets list page
        if (referrerPath === '/worksheets') {
          setBackUrl('/worksheets');
          setBackLabel('Back to All Worksheets');
        }
        // If coming from the landing page
        else if (referrerPath === '/') {
          setBackUrl('/');
          setBackLabel('Back to Resources');
        }
        // If coming from any other page within the same domain
        else if (referrerUrl.hostname === window.location.hostname) {
          setBackUrl(referrerPath);
          setBackLabel('Back');
        }
        // Default fallback
        else {
          setBackUrl('/');
          setBackLabel('Back to Resources');
        }
      } catch (_error) {
        // If referrer URL parsing fails, default to home
        setBackUrl('/');
        setBackLabel('Back to Resources');
      }
    } else {
      // No referrer, check if we can use browser history
      setBackUrl('/worksheets');
      setBackLabel('Back to All Worksheets');
    }
  }, []);

  const handleBackNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Try to use browser back if it's safe
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to the determined URL
      router.push(backUrl);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Back Navigation */}
          <button
            onClick={handleBackNavigation}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
          >
            <svg 
              className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            <span className="font-medium">{backLabel}</span>
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center text-sm text-gray-500">
            <Link 
              href="/"
              className="hover:text-gray-700 transition-colors"
            >
              Home
            </Link>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link 
              href="/worksheets"
              className="hover:text-gray-700 transition-colors"
            >
              Worksheets
            </Link>
            {worksheetTitle && (
              <>
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  {worksheetTitle}
                </span>
              </>
            )}
          </nav>

          {/* Alternative navigation links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/worksheets"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              All Worksheets
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
