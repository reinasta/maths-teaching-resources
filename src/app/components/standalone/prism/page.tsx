'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Prism from '@/components/Prism/Prism';
import PrismControls from './PrismControls';
import { PrismDimensions } from './types';
import { usePrismCalculations } from './hooks/usePrismCalculations';
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
    <div className="container mx-auto px-4 py-8">
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
    </div>
  );
};

export default PrismPage;