import Link from 'next/link';
import { WorksheetFrontmatter } from '@/utils/worksheet-utils';

interface WorksheetCardProps {
  slug: string;
  frontmatter: WorksheetFrontmatter;
}

export default function WorksheetCard({ slug, frontmatter }: WorksheetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {frontmatter.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {frontmatter.description}
        </p>
      </div>

      {/* Tags */}
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {frontmatter.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {frontmatter.tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{frontmatter.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* PDF Download Links */}
      <div className="space-y-2 mb-4">
        {frontmatter.worksheetPdf && (
          <a
            href={frontmatter.worksheetPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-colors w-full justify-center"
          >
            Download Worksheet
          </a>
        )}
        {frontmatter.answersPdf && (
          <a
            href={frontmatter.answersPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 transition-colors w-full justify-center"
          >
            Download Answers
          </a>
        )}
      </div>

      {/* See More Link */}
      <Link
        href={`/worksheets/${slug}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
      >
        See more details →
      </Link>
    </div>
  );
}
