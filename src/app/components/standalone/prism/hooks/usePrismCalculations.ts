import { useMemo } from 'react';
import { PrismDimensions } from '../types';
import { 
  calculateTriangleArea, 
  calculateTriangleHeight,
  calculateVolume,
  calculateSurfaceArea,
  validateTriangleInequality
} from '@/utils/geometry/triangularPrism';

interface PrismCalculations {
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
}

export function usePrismCalculations(dimensions: PrismDimensions): PrismCalculations {
  return useMemo(() => {
    const { sideA, sideB, sideC, height } = dimensions;

    // Validate triangle using pure function
    if (!validateTriangleInequality(sideA, sideB, sideC)) {
      return {
        triangleHeight: 0,
        surfaceArea: 0,
        volume: 0
      };
    }

    // Use pure calculation functions
    const triangleArea = calculateTriangleArea(sideA, sideB, sideC);
    const triangleHeight = calculateTriangleHeight(triangleArea, sideA, sideB, sideC);
    const volume = calculateVolume(triangleArea, height);
    const surfaceArea = calculateSurfaceArea(triangleArea, sideA, sideB, sideC, height);

    return {
      triangleHeight: Number(triangleHeight.toFixed(2)),
      surfaceArea: Number(surfaceArea.toFixed(2)),
      volume: Number(volume.toFixed(2))
    };
  }, [dimensions]);
}