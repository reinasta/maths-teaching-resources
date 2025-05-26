// src/app/components/standalone/coordinate-plane/page.tsx
'use client';

import React from 'react';
import PlottingPointsSection from '@/components/PlottingPointsSection';
import StandaloneLayout from '@/components/StandaloneLayout';

export default function CoordinatePlanePage() {
  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">Interactive Coordinate Plane</h1>
      <p className="mb-8">Explore plotting points on a coordinate plane.</p>
      
      <PlottingPointsSection />
    </StandaloneLayout>
  );
}