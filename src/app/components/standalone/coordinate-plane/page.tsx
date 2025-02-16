// src/app/components/standalone/coordinate-plane/page.tsx
'use client';

import PlottingPointsSection from '@/components/PlottingPointsSection';

export default function CoordinatePlanePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interactive Coordinate Plane</h1>
      <p className="mb-8">Explore plotting points on a coordinate plane.</p>
      
      <PlottingPointsSection />
    </div>
  );
}