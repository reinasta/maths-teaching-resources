import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getWorksheetDataBySlug, getWorksheetSlugs } from '@/utils/worksheet-utils';
import WorksheetNavigationHeader from '@/components/WorksheetNavigationHeader';
import type { Metadata } from 'next';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

interface WorksheetPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all worksheets
export async function generateStaticParams() {
  const slugs = getWorksheetSlugs();
  return slugs;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: WorksheetPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const worksheetData = getWorksheetDataBySlug(resolvedParams.slug);
  
  if (!worksheetData) {
    return {
      title: 'Worksheet Not Found',
    };
  }

  const { frontmatter } = worksheetData;
  
  return {
    title: `${frontmatter.title} | ReMaths Worksheets`,
    description: frontmatter.description,
    keywords: frontmatter.tags?.join(', '),
  };
}

export default async function WorksheetPage({ params }: WorksheetPageProps) {
  const resolvedParams = await params;
  const worksheetData = getWorksheetDataBySlug(resolvedParams.slug);

  if (!worksheetData) {
    notFound();
  }

  const { frontmatter, content } = worksheetData;

  return (
    <div className="min-h-screen bg-white">
      <WorksheetNavigationHeader worksheetTitle={frontmatter.title} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {frontmatter.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {frontmatter.description}
          </p>
          
          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* PDF Download Links */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Download Resources</h3>
              <div className="space-y-2">
                {frontmatter.worksheetPdf && (
                  <a
                    href={frontmatter.worksheetPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📄 Download Worksheet PDF
                  </a>
                )}
                {frontmatter.answersPdf && (
                  <a
                    href={frontmatter.answersPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-0 sm:ml-2"
                  >
                    ✅ Download Answers PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
