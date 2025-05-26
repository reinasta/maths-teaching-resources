import { PrismDimensions } from '@/app/components/standalone/prism/types';
import { Vector2 } from '../threejs/imports';

export interface TriangularPrismCalculations {
  triangleArea: number;
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
  isValid: boolean;
}

// Geometric utility functions for triangle calculations

/**
 * Calculates the three vertices of a triangle given its side lengths using the law of cosines
 * Places the first vertex at origin, second vertex on the x-axis, and calculates the third vertex
 * 
 * @param a - First side length (between vertices 1 and 2)
 * @param b - Second side length (between vertices 1 and 3) 
 * @param c - Third side length (between vertices 2 and 3)
 * @returns Array of three Vector2 points representing the triangle vertices
 */
export function calculateTriangleVertices(a: number, b: number, c: number): [Vector2, Vector2, Vector2] {
  const v1 = new Vector2(0, 0);
  const v2 = new Vector2(a, 0);
  
  // Use law of cosines to find the angle at vertex 1
  const cosC = (a * a + b * b - c * c) / (2 * a * b);
  const sinC = Math.sqrt(1 - cosC * cosC);
  
  const v3 = new Vector2(
    b * cosC,
    b * sinC
  );

  return [v1, v2, v3];
}

/**
 * Calculates the outward-facing perpendicular direction for a given edge of a triangle
 * Used for creating prism nets and unfolded views
 * 
 * @param edgeStart - Starting point of the edge
 * @param edgeEnd - Ending point of the edge
 * @param thirdVertex - The third vertex of the triangle (not on the edge)
 * @returns Unit vector pointing outward from the triangle edge
 */
export function calculateOutwardPerp(
  edgeStart: Vector2, 
  edgeEnd: Vector2, 
  thirdVertex: Vector2
): Vector2 {
  // Calculate edge direction
  const edgeDir = new Vector2().subVectors(edgeEnd, edgeStart);
  
  if (edgeDir.length() === 0) {
    throw new Error('Edge start and end points cannot be the same');
  }
  
  // Normalize
  const normDir = edgeDir.clone().normalize();
  
  // Initial perpendicular (90 degrees counterclockwise)
  const perp = new Vector2(-normDir.y, normDir.x);
  
  // Calculate vector from edgeStart to the third vertex
  const toVertex = new Vector2().subVectors(thirdVertex, edgeStart);
  
  // Dot product of perp with toVertex determines if pointing inside or outside
  const dot = perp.dot(toVertex);
  
  // If dot product is positive, perp is pointing toward the vertex (inside)
  // so we need to reverse it
  if (dot > 0) {
    return perp.multiplyScalar(-1);
  }
  
  // Already pointing outside
  return perp;
}

/**
 * Finds the third vertex of a triangle given two vertices and the distances to the third vertex
 * Uses the law of cosines to calculate the position
 * 
 * @param v1 - First known vertex
 * @param v2 - Second known vertex
 * @param lengthToV1 - Distance from the third vertex to v1
 * @param lengthToV2 - Distance from the third vertex to v2
 * @returns The third vertex position
 */
export function findThirdVertex(
  v1: Vector2, 
  v2: Vector2, 
  lengthToV1: number, 
  lengthToV2: number
): Vector2 {
  if (lengthToV1 <= 0 || lengthToV2 <= 0) {
    throw new Error('Side lengths must be positive');
  }

  // Direction vector from v1 to v2
  const dir = new Vector2().subVectors(v2, v1);
  
  // Length of the edge v1-v2
  const edgeLength = dir.length();
  
  if (edgeLength === 0) {
    throw new Error('v1 and v2 cannot be the same point');
  }

  // Check triangle inequality
  if (lengthToV1 + edgeLength <= lengthToV2 || 
      lengthToV1 + lengthToV2 <= edgeLength || 
      edgeLength + lengthToV2 <= lengthToV1) {
    throw new Error('Invalid triangle: sides do not satisfy triangle inequality');
  }
  
  // Calculate the angle using the law of cosines
  const angleCos = (lengthToV1 * lengthToV1 + edgeLength * edgeLength - lengthToV2 * lengthToV2) / 
                   (2 * lengthToV1 * edgeLength);
  
  // Clamp to valid range to handle floating point errors
  const clampedAngleCos = Math.max(-1, Math.min(1, angleCos));
  const angleSin = Math.sqrt(1 - clampedAngleCos * clampedAngleCos);
  
  // Unit vector in the direction of the edge
  const unitDir = dir.clone().normalize();
  
  // Perpendicular unit vector (90 degrees counterclockwise)
  const perpDir = new Vector2(-unitDir.y, unitDir.x);
  
  // The third vertex coordinates
  return new Vector2(
    v1.x + lengthToV1 * (unitDir.x * clampedAngleCos + perpDir.x * angleSin),
    v1.y + lengthToV1 * (unitDir.y * clampedAngleCos + perpDir.y * angleSin)
  );
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
