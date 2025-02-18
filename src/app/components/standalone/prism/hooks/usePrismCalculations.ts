import { useMemo } from 'react';
import { PrismDimensions } from '../types';

interface PrismCalculations {
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
}

export function usePrismCalculations(dimensions: PrismDimensions): PrismCalculations {
  return useMemo(() => {
    const { sideA, sideB, sideC, height } = dimensions;

    // Calculate triangle height using Heron's formula
    const s = (sideA + sideB + sideC) / 2; // semi-perimeter
    const triangleArea = Math.sqrt(
      s * (s - sideA) * (s - sideB) * (s - sideC)
    );
    const triangleHeight = (2 * triangleArea) / Math.max(sideA, sideB, sideC);

    // Calculate surface area
    const lateralArea = (sideA + sideB + sideC) * height;
    const surfaceArea = 2 * triangleArea + lateralArea;

    // Calculate volume
    const volume = triangleArea * height;

    return {
      triangleHeight: Number(triangleHeight.toFixed(2)),
      surfaceArea: Number(surfaceArea.toFixed(2)),
      volume: Number(volume.toFixed(2))
    };
  }, [dimensions]);
}