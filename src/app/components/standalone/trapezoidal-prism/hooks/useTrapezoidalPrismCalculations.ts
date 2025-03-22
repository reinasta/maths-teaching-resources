import { useMemo } from 'react';
import { TrapezoidalPrismDimensions } from '../types';

interface TrapezoidalPrismCalculations {
  surfaceArea: number;
  volume: number;
  isValid: boolean;
}

export function useTrapezoidalPrismCalculations(dimensions: TrapezoidalPrismDimensions): TrapezoidalPrismCalculations {
  return useMemo(() => {
    const { topWidth, bottomWidth, height, depth } = dimensions;

    // Check if the dimensions form a valid trapezoidal prism
    const isValid = topWidth > 0 && bottomWidth > 0 && height > 0 && depth > 0;
    
    if (!isValid) {
      return {
        surfaceArea: 0,
        volume: 0,
        isValid: false
      };
    }

    // Calculate surface area
    // Top and bottom faces are rectangles
    const topFaceArea = topWidth * depth;
    const bottomFaceArea = bottomWidth * depth;
    
    // Side faces - two trapezoids and two rectangles
    const frontBackFacesArea = 2 * ((topWidth + bottomWidth) / 2) * height;
    const leftRightFacesArea = 2 * depth * height;
    
    // Total surface area
    const surfaceArea = topFaceArea + bottomFaceArea + frontBackFacesArea + leftRightFacesArea;

    // Calculate volume (average of top and bottom areas multiplied by height)
    const volume = ((topWidth * depth) + (bottomWidth * depth)) / 2 * height;

    return {
      surfaceArea: Number(surfaceArea.toFixed(2)),
      volume: Number(volume.toFixed(2)),
      isValid: true
    };
  }, [dimensions]);
}