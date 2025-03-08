// src/components/NavigationHeader/index.tsx
import Link from 'next/link'

export default function NavigationHeader() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          href="/"
          className="flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <svg 
            className="w-5 h-5 mr-2" 
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
          <span className="font-medium">Back to Resources</span>
        </Link>
      </div>
    </header>
  )
}