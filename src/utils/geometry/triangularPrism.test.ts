import {
  validateTriangleInequality,
  calculateTriangleArea,
  calculateTriangleHeight,
  calculateVolume,
  calculateSurfaceArea,
  calculateTriangularPrismValues
} from './triangularPrism';
import { PrismDimensions } from '@/app/components/standalone/prism/types';

describe('Triangular Prism Calculations', () => {
  describe('validateTriangleInequality', () => {
    it('should return true for valid triangles', () => {
      expect(validateTriangleInequality(3, 4, 5)).toBe(true); // Right triangle
      expect(validateTriangleInequality(5, 5, 5)).toBe(true); // Equilateral
      expect(validateTriangleInequality(3, 4, 6)).toBe(true); // Scalene
    });

    it('should return false for invalid triangles', () => {
      expect(validateTriangleInequality(1, 2, 5)).toBe(false); // Violates triangle inequality
      expect(validateTriangleInequality(0, 4, 5)).toBe(false); // Zero side
      expect(validateTriangleInequality(-1, 4, 5)).toBe(false); // Negative side
      expect(validateTriangleInequality(1, 1, 2)).toBe(false); // Degenerate triangle
    });
  });

  describe('calculateTriangleArea', () => {
    it('should calculate area correctly using Heron\'s formula', () => {
      // Right triangle 3-4-5
      expect(calculateTriangleArea(3, 4, 5)).toBeCloseTo(6, 5);
      
      // Equilateral triangle with side 6
      // Area = (√3/4) * a² = (√3/4) * 36 ≈ 15.588
      expect(calculateTriangleArea(6, 6, 6)).toBeCloseTo(15.588, 3);
    });

    it('should throw error for invalid triangles', () => {
      expect(() => calculateTriangleArea(1, 2, 5)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
      expect(() => calculateTriangleArea(0, 4, 5)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
    });
  });

  describe('calculateTriangleHeight', () => {
    it('should calculate height correctly from area and longest side', () => {
      // Right triangle 3-4-5, area = 6, longest side = 5
      // Height = (2 * 6) / 5 = 2.4
      expect(calculateTriangleHeight(6, 3, 4, 5)).toBeCloseTo(2.4, 5);
      
      // Equilateral triangle with side 6, area ≈ 15.588
      // Height = (2 * 15.588) / 6 ≈ 5.196
      expect(calculateTriangleHeight(15.588, 6, 6, 6)).toBeCloseTo(5.196, 3);
    });
  });

  describe('calculateVolume', () => {
    it('should calculate volume correctly', () => {
      expect(calculateVolume(6, 10)).toBe(60); // Triangle area 6, height 10
      expect(calculateVolume(15.588, 5)).toBeCloseTo(77.94, 2);
    });
  });

  describe('calculateSurfaceArea', () => {
    it('should calculate surface area correctly', () => {
      // Triangle area = 6, sides 3-4-5, prism height = 10
      // Surface area = 2 * 6 + (3 + 4 + 5) * 10 = 12 + 120 = 132
      expect(calculateSurfaceArea(6, 3, 4, 5, 10)).toBe(132);
      
      // Equilateral triangle: area ≈ 15.588, sides 6-6-6, height = 8
      // Surface area = 2 * 15.588 + (6 + 6 + 6) * 8 = 31.176 + 144 = 175.176
      expect(calculateSurfaceArea(15.588, 6, 6, 6, 8)).toBeCloseTo(175.176, 3);
    });
  });

  describe('calculateTriangularPrismValues', () => {
    it('should calculate all values correctly for valid triangle', () => {
      const dimensions: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 10
      };

      const result = calculateTriangularPrismValues(dimensions);

      expect(result.isValid).toBe(true);
      expect(result.triangleArea).toBe(6); // Area of 3-4-5 triangle
      expect(result.triangleHeight).toBe(2.4); // Height using longest side (5)
      expect(result.volume).toBe(60); // 6 * 10
      expect(result.surfaceArea).toBe(132); // 2*6 + (3+4+5)*10
    });

    it('should return zeros for invalid triangle', () => {
      const dimensions: PrismDimensions = {
        sideA: 1,
        sideB: 2,
        sideC: 5, // Invalid - violates triangle inequality
        height: 10
      };

      const result = calculateTriangularPrismValues(dimensions);

      expect(result.isValid).toBe(false);
      expect(result.triangleArea).toBe(0);
      expect(result.triangleHeight).toBe(0);
      expect(result.volume).toBe(0);
      expect(result.surfaceArea).toBe(0);
    });

    it('should handle equilateral triangle correctly', () => {
      const dimensions: PrismDimensions = {
        sideA: 6,
        sideB: 6,
        sideC: 6,
        height: 8
      };

      const result = calculateTriangularPrismValues(dimensions);

      expect(result.isValid).toBe(true);
      expect(result.triangleArea).toBeCloseTo(15.59, 2);
      expect(result.triangleHeight).toBeCloseTo(5.20, 2);
      expect(result.volume).toBeCloseTo(124.71, 2);
      expect(result.surfaceArea).toBeCloseTo(175.18, 2);
    });

    it('should format numbers to 2 decimal places', () => {
      const dimensions: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 10
      };

      const result = calculateTriangularPrismValues(dimensions);

      // Ensure all results are formatted to 2 decimal places
      expect(Number.isInteger(result.triangleArea * 100)).toBe(true);
      expect(Number.isInteger(result.triangleHeight * 100)).toBe(true);
      expect(Number.isInteger(result.volume * 100)).toBe(true);
      expect(Number.isInteger(result.surfaceArea * 100)).toBe(true);
    });
  });
});
