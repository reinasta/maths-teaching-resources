import { getAllWorksheetsData } from '@/utils/worksheet-utils';
import WorksheetCard from './WorksheetCard';
import Link from 'next/link';

export default function WorksheetsSection() {
  const allWorksheets = getAllWorksheetsData();
  
  // Show only the 3 most recent worksheets on the landing page
  const recentWorksheets = allWorksheets.slice(0, 3);

  // Don't render the section if there are no worksheets
  if (recentWorksheets.length === 0) {
    return null;
  }

  return (
    <section className="col-span-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Maths Worksheets
        </h2>
        <p className="text-gray-600">
          Download printable worksheets to practice key mathematical concepts
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {recentWorksheets.map((worksheet) => (
          <WorksheetCard
            key={worksheet.slug}
            slug={worksheet.slug}
            frontmatter={worksheet.frontmatter}
          />
        ))}
      </div>

      {/* View All Worksheets Link */}
      <div className="text-center">
        <Link
          href="/worksheets"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View all worksheets →
        </Link>
      </div>
    </section>
  );
}
