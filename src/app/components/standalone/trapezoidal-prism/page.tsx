'use client';

import React, { useState, useMemo } from 'react';
import StandaloneLayout from '@/components/StandaloneLayout';
import TrapezoidalPrism from '@/components/Prism/TrapezoidalPrism';
import TrapezoidalPrismControls from '@/components/PrismControls/TrapezoidalPrismControls';
import { TrapezoidalPrismDimensions, VisualStyle } from './types';
import { calculateTrapezoidalPrismValues } from '@/utils/trapezoidalPrismCalculations';
import './styles.css';

export default function TrapezoidalPrismPage() {
  const [dimensions, setDimensions] = useState<TrapezoidalPrismDimensions>({
    topWidth: 2,
    bottomWidth: 3,
    height: 2,
    depth: 2
  });
  
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('solid');
  
  // Calculate derived values
  const calculations = useMemo(() => 
    calculateTrapezoidalPrismValues(dimensions), 
    [dimensions]
  );

  return (
    <StandaloneLayout
      title="Trapezoidal Prism"
      description="Interactive 3D trapezoidal prism with adjustable dimensions"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/3 mb-6 lg:mb-0">
          <TrapezoidalPrism
            dimensions={dimensions}
            isUnfolded={isUnfolded}
            visualStyle={visualStyle}
          />
        </div>
        <div className="lg:w-1/3 lg:pl-6">
          <TrapezoidalPrismControls
            dimensions={dimensions}
            calculations={calculations}
            onDimensionsChange={setDimensions}
            onUnfoldChange={setIsUnfolded}
            visualStyle={visualStyle}
            onVisualStyleChange={setVisualStyle}
          />
        </div>
      </div>
    </StandaloneLayout>
  );
}