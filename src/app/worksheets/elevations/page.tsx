import { Metadata } from 'next';
import Link from 'next/link';
import { getAllWorksheetsData } from '@/utils/worksheet-utils';
import WorksheetCard from '@/components/WorksheetCard';

export const metadata: Metadata = {
  title: 'Plans & Elevations | ReMaths Worksheets',
  description: 'Worksheets on front and side elevations and plan views.',
  keywords: 'elevations, plans, front elevation, side elevation, plan views, worksheets',
};

export default function PlansAndElevationsPage() {
  const allWorksheets = getAllWorksheetsData();
  const topics = allWorksheets.filter(ws =>
    ['3d-solids-drawing-from-elevations'].includes(ws.slug)
  );

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Plans & Elevations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice drawing and interpreting front and side elevations and plan views.
          </p>
        </div>

        {topics.length === 0 ? (
          <p className="text-gray-500 text-lg">No worksheets available for Plans & Elevations.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((ws) => (
              <WorksheetCard
                key={ws.slug}
                slug={ws.slug}
                frontmatter={ws.frontmatter}
              />
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/worksheets"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to all worksheets
          </Link>
        </div>
      </main>
    </div>
  );
}
