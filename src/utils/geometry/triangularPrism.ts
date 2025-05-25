import { PrismDimensions } from '@/app/components/standalone/prism/types';

export interface TriangularPrismCalculations {
  triangleArea: number;
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
  isValid: boolean;
}

// Pure calculation functions - easier to test and debug

/**
 * Validates if three sides can form a valid triangle using triangle inequality theorem
 * Triangle inequality: The sum of any two sides must be greater than the third side
 * 
 * @param sideA - First side length
 * @param sideB - Second side length  
 * @param sideC - Third side length
 * @returns true if the sides form a valid triangle, false otherwise
 */
export function validateTriangleInequality(sideA: number, sideB: number, sideC: number): boolean {
  if (sideA <= 0 || sideB <= 0 || sideC <= 0) {
    return false;
  }
  
  return (sideA + sideB > sideC) && 
         (sideA + sideC > sideB) && 
         (sideB + sideC > sideA);
}

/**
 * Calculates the area of a triangle using Heron's formula
 * Formula: √[s(s-a)(s-b)(s-c)] where s = (a+b+c)/2 (semi-perimeter)
 * 
 * @param sideA - First side length
 * @param sideB - Second side length
 * @param sideC - Third side length
 * @returns Area of the triangle
 * @throws Error if the sides don't form a valid triangle
 */
export function calculateTriangleArea(sideA: number, sideB: number, sideC: number): number {
  if (!validateTriangleInequality(sideA, sideB, sideC)) {
    throw new Error('Invalid triangle: sides do not satisfy triangle inequality');
  }
  
  const s = (sideA + sideB + sideC) / 2; // semi-perimeter
  const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
  
  return area;
}

/**
 * Calculates the height of a triangle from its area and base
 * Formula: height = (2 * area) / base
 * Uses the longest side as the base for the most stable calculation
 * 
 * @param triangleArea - The area of the triangle
 * @param sideA - First side length
 * @param sideB - Second side length  
 * @param sideC - Third side length
 * @returns Height of the triangle perpendicular to the longest side
 */
export function calculateTriangleHeight(triangleArea: number, sideA: number, sideB: number, sideC: number): number {
  const longestSide = Math.max(sideA, sideB, sideC);
  return (2 * triangleArea) / longestSide;
}

/**
 * Calculates the volume of a triangular prism
 * Formula: Volume = triangle_area × height
 * 
 * @param triangleArea - Area of the triangular base
 * @param height - Height of the prism
 * @returns Volume of the triangular prism
 */
export function calculateVolume(triangleArea: number, height: number): number {
  return triangleArea * height;
}

/**
 * Calculates the total surface area of a triangular prism
 * Components: 2 triangular faces + 3 rectangular side faces
 * Formula: 2 × triangle_area + (sideA + sideB + sideC) × height
 * 
 * @param triangleArea - Area of the triangular base
 * @param sideA - First side length of triangle
 * @param sideB - Second side length of triangle
 * @param sideC - Third side length of triangle
 * @param height - Height of the prism
 * @returns Total surface area of the triangular prism
 */
export function calculateSurfaceArea(
  triangleArea: number, 
  sideA: number, 
  sideB: number, 
  sideC: number, 
  height: number
): number {
  const lateralArea = (sideA + sideB + sideC) * height;
  return 2 * triangleArea + lateralArea;
}

/**
 * Main composite function that calculates all triangular prism values
 * Maintains compatibility with existing API patterns
 * 
 * @param dimensions - Object containing sideA, sideB, sideC, and height
 * @returns Complete calculations for the triangular prism
 */
export function calculateTriangularPrismValues(dimensions: PrismDimensions): TriangularPrismCalculations {
  const { sideA, sideB, sideC, height } = dimensions;
  
  // Validate triangle
  const isValid = validateTriangleInequality(sideA, sideB, sideC);
  
  if (!isValid) {
    return {
      triangleArea: 0,
      triangleHeight: 0,
      surfaceArea: 0,
      volume: 0,
      isValid: false
    };
  }
  
  // Calculate all values using pure functions
  const triangleArea = calculateTriangleArea(sideA, sideB, sideC);
  const triangleHeight = calculateTriangleHeight(triangleArea, sideA, sideB, sideC);
  const volume = calculateVolume(triangleArea, height);
  const surfaceArea = calculateSurfaceArea(triangleArea, sideA, sideB, sideC, height);
  
  return {
    triangleArea: Number(triangleArea.toFixed(2)),
    triangleHeight: Number(triangleHeight.toFixed(2)),
    surfaceArea: Number(surfaceArea.toFixed(2)),
    volume: Number(volume.toFixed(2)),
    isValid: true
  };
}
