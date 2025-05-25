import React, { useState, useMemo } from 'react';
import Prism, { PrismDimensions, VisualStyle, LabelConfig } from '../../../components/Prism/Prism';
import PrismControls from '../../../components/PrismControls/PrismControls';
import LabelLegend from '../../../components/LabelLegend/LabelLegend';

const TriangularPrismComponent: React.FC = () => {
  const [dimensions, setDimensions] = useState<PrismDimensions>({
    sideA: 3,
    sideB: 3,
    sideC: 3,
    height: 3
  });
  
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('solid');
  
  const [labelConfig, setLabelConfig] = useState<LabelConfig>({
    showVolume: true,
    showSurfaceArea: false,
    showFaces: false
  });

  const calculations = useMemo(() => {
    // Calculate triangle height using Heron's formula
    const { sideA, sideB, sideC, height } = dimensions;
    const s = (sideA + sideB + sideC) / 2; // semi-perimeter
    const triangleArea = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
    const base = Math.max(sideA, sideB, sideC);
    const triangleHeight = (2 * triangleArea) / base;
    
    // Calculate surface area
    // Surface area = 2 * triangle area + perimeter * height
    const surfaceArea = 2 * triangleArea + (sideA + sideB + sideC) * height;
    
    // Calculate volume
    // Volume = triangle area * height
    const volume = triangleArea * height;
    
    return {
      triangleHeight,
      surfaceArea,
      volume
    };
  }, [dimensions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Triangular Prism Visualization</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 h-full">
            <Prism 
              dimensions={dimensions} 
              isUnfolded={isUnfolded}
              visualStyle={visualStyle}
              labelConfig={labelConfig}
            />
            
            <LabelLegend labelConfig={labelConfig} />
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <PrismControls
              dimensions={dimensions}
              calculations={calculations}
              onDimensionsChange={setDimensions}
              onUnfoldChange={setIsUnfolded}
              visualStyle={visualStyle}
              onVisualStyleChange={setVisualStyle}
              labelConfig={labelConfig}
              onLabelConfigChange={setLabelConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriangularPrismComponent;