'use client';

import React, { useState } from 'react';
import Prism from '@/components/Prism/Prism';
import PrismControls from './PrismControls';
import { PrismDimensions } from './types';
import { usePrismCalculations } from './hooks/usePrismCalculations';
import StandaloneLayout from '@/components/StandaloneLayout';
import './styles.css';

const PrismPage: React.FC = () => {
  const [dimensions, setDimensions] = useState<PrismDimensions>({
    sideA: 2,
    sideB: 2,
    sideC: 2,
    height: 3
  });
  const [isUnfolded, setIsUnfolded] = useState(false);
  
  const calculations = usePrismCalculations(dimensions);

  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">Triangular Prism Visualization</h1>
      <div className="conversion-layout">
        <div className="visualization-container">
          <Prism 
            dimensions={dimensions}
            isUnfolded={isUnfolded}
          />
        </div>
        <div className="controls-container">
          <PrismControls
            dimensions={dimensions}
            calculations={calculations}
            onDimensionsChange={setDimensions}
            onUnfoldChange={setIsUnfolded}
          />
        </div>
      </div>
    </StandaloneLayout>
  );
};

export default PrismPage;