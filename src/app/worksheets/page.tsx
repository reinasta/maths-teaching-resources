import { getAllWorksheetsData } from '@/utils/worksheet-utils';
import Link from 'next/link';
import type { Metadata } from 'next';
import WorksheetCard from '@/components/WorksheetCard';

// Static metadata for the worksheets list page
export const metadata: Metadata = {
  title: 'Maths Worksheets | ReMaths',
  description: 'Browse our collection of downloadable maths worksheets covering algebra, geometry, fractions, and more.',
  keywords: 'maths worksheets, algebra, geometry, fractions, education, practice problems',
};

export default function WorksheetsPage() {
  const worksheets = getAllWorksheetsData();

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Maths Worksheets
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download and print our collection of carefully crafted maths worksheets. 
            Each worksheet includes detailed solutions and is designed to reinforce key mathematical concepts.
          </p>
        </div>        {/* Worksheets List */}
        {worksheets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No worksheets available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {worksheets.map((worksheet) => (
              <WorksheetCard
                key={worksheet.slug}
                slug={worksheet.slug}
                frontmatter={worksheet.frontmatter}
              />
            ))}
          </div>
        )}

        {/* Back to home link */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
