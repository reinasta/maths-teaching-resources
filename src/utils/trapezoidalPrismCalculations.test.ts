import { 
  calculateTrapezoidalPrismValues,
  calculateVolume,
  calculateTrapezoidalFaceArea,
  calculateSideLength,
  calculateSurfaceArea
} from '@/utils/trapezoidalPrismCalculations';
import { TrapezoidalPrismDimensions } from '@/app/components/standalone/trapezoidal-prism/types';

describe('calculateTrapezoidalPrismValues', () => {
  const typicalDimensions: TrapezoidalPrismDimensions = {
    topWidth: 2,
    bottomWidth: 4,
    height: 3,
    depth: 5,
  };

  const rectangularDimensions: TrapezoidalPrismDimensions = {
    topWidth: 3,
    bottomWidth: 3,
    height: 2,
    depth: 4,
  };

  it('calculates correct values for a typical trapezoidal prism', () => {
    const result = calculateTrapezoidalPrismValues(typicalDimensions);
    expect(result.volume).toBeCloseTo(45, 2); // ((2+4)/2)*3*5 = 45
    expect(result.leftSide).toBeCloseTo(Math.sqrt(10), 2); // sqrt((2^2) + (3^2)) = sqrt(4+9) = sqrt(13) - wait, let me recalculate
    expect(result.rightSide).toBeCloseTo(Math.sqrt(10), 2); // Should be same as leftSide
  });

  it('handles rectangular prism (topWidth == bottomWidth)', () => {
    const result = calculateTrapezoidalPrismValues(rectangularDimensions);
    expect(result.volume).toBeCloseTo(24, 2); // 3*2*4 = 24
    expect(result.leftSide).toBeCloseTo(2, 2); // Since topWidth == bottomWidth, side length = height
    expect(result.rightSide).toBeCloseTo(2, 2);
  });
});

describe('Individual pure functions', () => {
  const typicalDimensions: TrapezoidalPrismDimensions = {
    topWidth: 2,
    bottomWidth: 4,
    height: 3,
    depth: 5,
  };

  describe('calculateVolume', () => {
    it('calculates volume correctly', () => {
      expect(calculateVolume(typicalDimensions)).toBeCloseTo(45, 2); // ((2+4)/2)*3*5 = 45
    });
  });

  describe('calculateTrapezoidalFaceArea', () => {
    it('calculates trapezoidal face area correctly', () => {
      expect(calculateTrapezoidalFaceArea(typicalDimensions)).toBeCloseTo(9, 2); // ((2+4)/2)*3 = 9
    });
  });

  describe('calculateSideLength', () => {
    it('calculates side length for trapezoidal prism', () => {
      // Width difference = |4-2|/2 = 1, height = 3
      // Side length = sqrt(1^2 + 3^2) = sqrt(10) ≈ 3.162
      expect(calculateSideLength(typicalDimensions)).toBeCloseTo(Math.sqrt(10), 2);
    });

    it('calculates side length for rectangular prism (no slope)', () => {
      const rectangularDims = { topWidth: 3, bottomWidth: 3, height: 2, depth: 4 };
      // Width difference = 0, so side length = height = 2
      expect(calculateSideLength(rectangularDims)).toBeCloseTo(2, 2);
    });
  });

  describe('calculateSurfaceArea', () => {
    it('calculates surface area correctly', () => {
      // 2 trapezoid faces: 2 * 9 = 18
      // 2 side rectangles: 2 * (sqrt(10) * 5) = 2 * 5 * sqrt(10) ≈ 31.62
      // Top rectangle: 2 * 5 = 10
      // Bottom rectangle: 4 * 5 = 20
      // Total: 18 + 31.62 + 10 + 20 = 79.62
      const expected = 2 * 9 + 2 * Math.sqrt(10) * 5 + 2 * 5 + 4 * 5;
      expect(calculateSurfaceArea(typicalDimensions)).toBeCloseTo(expected, 2);
    });
  });
});
