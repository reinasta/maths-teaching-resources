import { TrapezoidalPrismDimensions } from '../app/components/standalone/trapezoidal-prism/types';

export interface TrapezoidalPrismCalculations {
  leftSide: number;
  rightSide: number;
  surfaceArea: number;
  volume: number;
}

export function calculateTrapezoidalPrismValues(
  dimensions: TrapezoidalPrismDimensions
): TrapezoidalPrismCalculations {
  const { topWidth, bottomWidth, height, depth } = dimensions;
  
  // Calculate left and right side lengths using the Pythagorean theorem
  // For each side, we need to find the hypotenuse of a right triangle 
  // with base = half the difference between top and bottom width, and height = height
  const widthDifference = Math.abs(bottomWidth - topWidth) / 2;
  const sideLength = Math.sqrt(Math.pow(widthDifference, 2) + Math.pow(height, 2));
  
  const leftSide = sideLength;
  const rightSide = sideLength;
  
  // Calculate surface area:
  // 2 trapezoid faces + 2 rectangular faces on sides + top and bottom rectangular faces
  const trapezoidArea = ((topWidth + bottomWidth) / 2) * height;
  const sideRectArea = sideLength * depth;
  const topBottomArea = depth * topWidth;
  const baseBottomArea = depth * bottomWidth;
  
  const surfaceArea = 2 * trapezoidArea + 2 * sideRectArea + topBottomArea + baseBottomArea;
  
  // Calculate volume: average width × height × depth
  const volume = ((topWidth + bottomWidth) / 2) * height * depth;
  
  return {
    leftSide,
    rightSide,
    surfaceArea,
    volume
  };
}