import { TrapezoidalPrismDimensions } from '../app/components/standalone/trapezoidal-prism/types';

export interface TrapezoidalPrismCalculations {
  leftSide: number;
  rightSide: number;
  surfaceArea: number;
  volume: number;
}

// Pure calculation functions - easier to test and debug

/**
 * Calculates the volume of a trapezoidal prism
 * Formula: ((topWidth + bottomWidth) / 2) * height * depth
 */
export function calculateVolume(dimensions: TrapezoidalPrismDimensions): number {
  const { topWidth, bottomWidth, height, depth } = dimensions;
  return ((topWidth + bottomWidth) / 2) * height * depth;
}

/**
 * Calculates the area of the trapezoidal face
 * Formula: ((topWidth + bottomWidth) / 2) * height
 */
export function calculateTrapezoidalFaceArea(dimensions: TrapezoidalPrismDimensions): number {
  const { topWidth, bottomWidth, height } = dimensions;
  return ((topWidth + bottomWidth) / 2) * height;
}

/**
 * Calculates the length of the slanted sides using Pythagorean theorem
 * For each side, we find the hypotenuse of a right triangle with:
 * - base = half the difference between top and bottom width
 * - height = height of the trapezoid
 */
export function calculateSideLength(dimensions: TrapezoidalPrismDimensions): number {
  const { topWidth, bottomWidth, height } = dimensions;
  const widthDifference = Math.abs(bottomWidth - topWidth) / 2;
  return Math.sqrt(Math.pow(widthDifference, 2) + Math.pow(height, 2));
}

/**
 * Calculates the total surface area of a trapezoidal prism
 * Components: 2 trapezoid faces + 2 side rectangles + top rectangle + bottom rectangle
 */
export function calculateSurfaceArea(dimensions: TrapezoidalPrismDimensions): number {
  const { topWidth, bottomWidth, depth } = dimensions;
  const sideLength = calculateSideLength(dimensions);
  const trapezoidArea = calculateTrapezoidalFaceArea(dimensions);
  
  const sideRectArea = sideLength * depth;
  const topArea = depth * topWidth;
  const bottomArea = depth * bottomWidth;
  
  return 2 * trapezoidArea + 2 * sideRectArea + topArea + bottomArea;
}

/**
 * Main composite function that calculates all trapezoidal prism values
 * Maintains existing API for backward compatibility
 */
export function calculateTrapezoidalPrismValues(
  dimensions: TrapezoidalPrismDimensions
): TrapezoidalPrismCalculations {
  const sideLength = calculateSideLength(dimensions);
  
  return {
    leftSide: sideLength,
    rightSide: sideLength,
    surfaceArea: calculateSurfaceArea(dimensions),
    volume: calculateVolume(dimensions)
  };
}