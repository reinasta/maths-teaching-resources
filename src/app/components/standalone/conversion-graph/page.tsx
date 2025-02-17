// src/app/components/standalone/conversion-graph/page.tsx
'use client';

import ConversionGraph from '@/components/ConversionGraph';

export default function ConversionGraphPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Unit Conversion Interactive Graph</h1>
      <p className="text-lg text-gray-600 mb-8">
        Explore the relationship between inches and centimetres using this interactive conversion graph.
      </p>
      
      <div className="container mx-auto px-4">
        <ConversionGraph/>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">How to Use This Graph</h2>
        <ul className="space-y-3 text-gray-700">
          <li>• The graph shows the relationship between inches (horizontal axis) and centimetres (vertical axis)</li>
          <li>• Click the buttons on the right to see different conversions animated</li>
          <li>• Follow the helper lines to see how to convert from one unit to another</li>
          <li>• The diagonal line shows that 1 inch is approximately equal to 2.5 centimetres</li>
        </ul>
      </div>
    </div>
  );
}