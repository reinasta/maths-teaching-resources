// src/app/components/standalone/conversion-graph/page.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import ConversionGraph from '@/components/ConversionGraph';

interface Dimensions {
  width: number;
  height: number;
}

export default function ConversionGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 900,
    height: 700
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setDimensions({
          width: containerWidth,
          height: Math.min(containerWidth * 0.75, window.innerHeight * 0.85)
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Unit Conversion Interactive Graph</h1>
      <p className="text-lg text-gray-600 mb-8">
        Explore the relationship between inches and centimetres using this interactive conversion graph.
      </p>
      
      <div ref={containerRef} className="w-full">
        <ConversionGraph
          width={dimensions.width}
          height={dimensions.height}
          fontSize={28}
        />
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