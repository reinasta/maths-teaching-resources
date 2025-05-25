import {
  calculateResponsiveMargins,
  calculateResponsiveFontSize,
  calculateInnerDimensions,
  createScaleConfig,
  calculateResponsiveTickSizes,
  generateGridLines,
  calculateAxisLabelPositions,
  calculateViewBox,
  calculateConversionGraphMargins,
  calculateCoordinatePlaneMargins,
  type MarginConfig,
  type DimensionConfig,
  type ScaleConfig,
  type GridConfig,
  type AxisLabelConfig
} from './coordinateCalculations';

describe('D3 Coordinate Calculations', () => {
  describe('calculateResponsiveMargins', () => {
    it('should calculate default margins correctly', () => {
      const margins = calculateResponsiveMargins(800, 600);
      
      expect(margins).toEqual({
        top: Math.max(45, 600 * 0.1), // 60
        right: Math.max(25, 800 * 0.05), // 40
        bottom: Math.max(50, 600 * 0.12), // 72
        left: Math.max(50, 800 * 0.1) // 80
      });
    });

    it('should use minimum margins when percentage would be smaller', () => {
      const margins = calculateResponsiveMargins(300, 200);
      
      expect(margins.top).toBe(45); // min > 200 * 0.1 (20)
      expect(margins.right).toBe(25); // min > 300 * 0.05 (15)
      expect(margins.bottom).toBe(50); // min > 200 * 0.12 (24)
      expect(margins.left).toBe(50); // min > 300 * 0.1 (30)
    });

    it('should use percentage-based margins for larger dimensions', () => {
      const margins = calculateResponsiveMargins(1200, 900);
      
      expect(margins.top).toBe(90); // 900 * 0.1
      expect(margins.right).toBe(60); // 1200 * 0.05
      expect(margins.bottom).toBe(108); // 900 * 0.12
      expect(margins.left).toBe(120); // 1200 * 0.1
    });

    it('should respect custom minimum margins', () => {
      const customMinMargins = { top: 60, left: 70 };
      const margins = calculateResponsiveMargins(400, 300, customMinMargins);
      
      expect(margins.top).toBe(60); // custom min > 300 * 0.1 (30)
      expect(margins.left).toBe(70); // custom min > 400 * 0.1 (40)
      expect(margins.right).toBe(25); // default min > 400 * 0.05 (20)
      expect(margins.bottom).toBe(50); // default min > 300 * 0.12 (36)
    });

    it('should respect custom percentages', () => {
      const customPercentages = { top: 0.15, right: 0.08 };
      const margins = calculateResponsiveMargins(800, 600, {}, customPercentages);
      
      expect(margins.top).toBe(90); // 600 * 0.15
      expect(margins.right).toBe(64); // 800 * 0.08
      expect(margins.bottom).toBe(72); // 600 * 0.12 (default)
      expect(margins.left).toBe(80); // 800 * 0.1 (default)
    });
  });

  describe('calculateResponsiveFontSize', () => {
    it('should calculate font size as percentage of smallest dimension', () => {
      const fontSize = calculateResponsiveFontSize(800, 600);
      expect(fontSize).toBe(15); // 600 * 0.025
    });

    it('should use width when width is smaller', () => {
      const fontSize = calculateResponsiveFontSize(500, 700);
      expect(fontSize).toBe(12.5); // 500 * 0.025
    });

    it('should respect minimum font size', () => {
      const fontSize = calculateResponsiveFontSize(200, 150);
      expect(fontSize).toBe(10); // minimum, not 150 * 0.025 = 3.75
    });

    it('should respect maximum font size', () => {
      const fontSize = calculateResponsiveFontSize(2000, 1500);
      expect(fontSize).toBe(24); // maximum, not 1500 * 0.025 = 37.5
    });

    it('should use custom scale factor', () => {
      const fontSize = calculateResponsiveFontSize(800, 600, 0.035);
      expect(fontSize).toBeCloseTo(21, 5); // 600 * 0.035
    });

    it('should use custom min and max values', () => {
      const fontSize = calculateResponsiveFontSize(200, 150, 0.025, 8, 16);
      expect(fontSize).toBe(8); // custom minimum
      
      const largeFont = calculateResponsiveFontSize(2000, 1500, 0.025, 8, 16);
      expect(largeFont).toBe(16); // custom maximum
    });
  });

  describe('calculateInnerDimensions', () => {
    it('should calculate inner dimensions correctly', () => {
      const dimensions = { width: 800, height: 600 };
      const margins = { top: 50, right: 30, bottom: 60, left: 40 };
      
      const inner = calculateInnerDimensions(dimensions, margins);
      
      expect(inner).toEqual({
        width: 730, // 800 - 30 - 40
        height: 490  // 600 - 50 - 60
      });
    });

    it('should handle zero margins', () => {
      const dimensions = { width: 500, height: 400 };
      const margins = { top: 0, right: 0, bottom: 0, left: 0 };
      
      const inner = calculateInnerDimensions(dimensions, margins);
      
      expect(inner).toEqual(dimensions);
    });

    it('should handle large margins', () => {
      const dimensions = { width: 300, height: 200 };
      const margins = { top: 80, right: 50, bottom: 70, left: 60 };
      
      const inner = calculateInnerDimensions(dimensions, margins);
      
      expect(inner).toEqual({
        width: 190, // 300 - 50 - 60
        height: 50   // 200 - 80 - 70
      });
    });
  });

  describe('createScaleConfig', () => {
    it('should create scale configuration correctly', () => {
      const config = createScaleConfig(0, 10, 0, 750);
      
      expect(config).toEqual({
        domainMin: 0,
        domainMax: 10,
        rangeMin: 0,
        rangeMax: 750
      });
    });

    it('should handle inverted ranges for y-scales', () => {
      const config = createScaleConfig(0, 25, 500, 0);
      
      expect(config).toEqual({
        domainMin: 0,
        domainMax: 25,
        rangeMin: 500,
        rangeMax: 0
      });
    });

    it('should handle negative values', () => {
      const config = createScaleConfig(-10, 10, -300, 300);
      
      expect(config).toEqual({
        domainMin: -10,
        domainMax: 10,
        rangeMin: -300,
        rangeMax: 300
      });
    });
  });

  describe('calculateResponsiveTickSizes', () => {
    it('should calculate tick sizes correctly', () => {
      const tickConfig = calculateResponsiveTickSizes(800);
      
      expect(tickConfig).toEqual({
        tickSize: 12, // 800 * 0.015 = 12
        tickPadding: 12
      });
    });

    it('should respect minimum size', () => {
      const tickConfig = calculateResponsiveTickSizes(200);
      
      expect(tickConfig).toEqual({
        tickSize: 6, // minimum, not 200 * 0.015 = 3
        tickPadding: 6
      });
    });

    it('should respect maximum size', () => {
      const tickConfig = calculateResponsiveTickSizes(1000);
      
      expect(tickConfig).toEqual({
        tickSize: 12, // maximum, not 1000 * 0.015 = 15
        tickPadding: 12
      });
    });

    it('should use custom scale factor', () => {
      const tickConfig = calculateResponsiveTickSizes(800, 0.02);
      
      expect(tickConfig).toEqual({
        tickSize: 12, // 800 * 0.02 = 16, but capped at max 12
        tickPadding: 12
      });
    });

    it('should use custom min and max values', () => {
      const tickConfig = calculateResponsiveTickSizes(400, 0.015, 4, 8);
      
      expect(tickConfig).toEqual({
        tickSize: 6, // 400 * 0.015 = 6
        tickPadding: 6
      });
    });
  });

  describe('generateGridLines', () => {
    it('should generate grid lines correctly', () => {
      const grid = generateGridLines(0, 10, 1, 0, 30, 5);
      
      expect(grid).toEqual({
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [0, 5, 10, 15, 20, 25, 30]
      });
    });

    it('should handle different step sizes', () => {
      const grid = generateGridLines(0, 6, 2, 0, 15, 3);
      
      expect(grid).toEqual({
        x: [0, 2, 4, 6],
        y: [0, 3, 6, 9, 12, 15]
      });
    });

    it('should handle decimal step sizes', () => {
      const grid = generateGridLines(0, 2, 0.5, 0, 10, 2.5);
      
      expect(grid).toEqual({
        x: [0, 0.5, 1, 1.5, 2],
        y: [0, 2.5, 5, 7.5, 10]
      });
    });

    it('should handle non-zero starting points', () => {
      const grid = generateGridLines(5, 10, 1, 10, 20, 2);
      
      expect(grid).toEqual({
        x: [5, 6, 7, 8, 9, 10],
        y: [10, 12, 14, 16, 18, 20]
      });
    });

    it('should handle single values', () => {
      const grid = generateGridLines(5, 5, 1, 10, 10, 1);
      
      expect(grid).toEqual({
        x: [5],
        y: [10]
      });
    });
  });

  describe('calculateAxisLabelPositions', () => {
    it('should calculate axis label positions correctly', () => {
      const innerDimensions = { width: 750, height: 500 };
      const margins = { top: 50, right: 25, bottom: 50, left: 50 };
      const baseFontSize = 15;
      
      const labelConfig = calculateAxisLabelPositions(
        innerDimensions,
        margins,
        baseFontSize,
        'inches',
        'centimetres'
      );
      
      expect(labelConfig).toEqual({
        xLabel: 'inches',
        yLabel: 'centimetres',
        xPosition: {
          x: 375, // 750 / 2
          y: 560  // 500 + 15 * 4
        },
        yPosition: {
          x: -250, // -(500 / 2)
          y: -35   // -50 + 15
        }
      });
    });

    it('should adjust positions based on font size', () => {
      const innerDimensions = { width: 600, height: 400 };
      const margins = { top: 40, right: 20, bottom: 40, left: 40 };
      const baseFontSize = 20;
      
      const labelConfig = calculateAxisLabelPositions(
        innerDimensions,
        margins,
        baseFontSize,
        'x',
        'y'
      );
      
      expect(labelConfig.xPosition).toEqual({
        x: 300, // 600 / 2
        y: 480  // 400 + 20 * 4
      });
      
      expect(labelConfig.yPosition).toEqual({
        x: -200, // -(400 / 2)
        y: -20   // -40 + 20
      });
    });
  });

  describe('calculateViewBox', () => {
    it('should create viewBox string correctly', () => {
      const viewBox = calculateViewBox(800, 600);
      expect(viewBox).toBe('0 0 800 600');
    });

    it('should handle different dimensions', () => {
      const viewBox = calculateViewBox(1200, 900);
      expect(viewBox).toBe('0 0 1200 900');
    });

    it('should handle decimal values', () => {
      const viewBox = calculateViewBox(800.5, 600.25);
      expect(viewBox).toBe('0 0 800.5 600.25');
    });
  });

  describe('calculateConversionGraphMargins', () => {
    it('should use conversion graph specific defaults', () => {
      const margins = calculateConversionGraphMargins(800, 600);
      
      // Should use conversion graph specific minimums and percentages
      expect(margins.top).toBe(Math.max(40, 600 * 0.1)); // 60
      expect(margins.right).toBe(Math.max(20, 800 * 0.05)); // 40
      expect(margins.bottom).toBe(Math.max(40, 600 * 0.1)); // 60
      expect(margins.left).toBe(Math.max(40, 800 * 0.08)); // 64
    });

    it('should work with small dimensions', () => {
      const margins = calculateConversionGraphMargins(300, 200);
      
      expect(margins.top).toBe(40); // min value
      expect(margins.right).toBe(20); // min value
      expect(margins.bottom).toBe(40); // min value
      expect(margins.left).toBe(40); // min value
    });
  });

  describe('calculateCoordinatePlaneMargins', () => {
    it('should use coordinate plane specific defaults', () => {
      const margins = calculateCoordinatePlaneMargins(800, 600);
      
      // Should use coordinate plane specific minimums and percentages
      expect(margins.top).toBe(Math.max(45, 600 * 0.1)); // 60
      expect(margins.right).toBe(Math.max(25, 800 * 0.05)); // 40
      expect(margins.bottom).toBe(Math.max(50, 600 * 0.12)); // 72
      expect(margins.left).toBe(Math.max(50, 800 * 0.1)); // 80
    });

    it('should work with small dimensions', () => {
      const margins = calculateCoordinatePlaneMargins(300, 200);
      
      expect(margins.top).toBe(45); // min value
      expect(margins.right).toBe(25); // min value
      expect(margins.bottom).toBe(50); // min value
      expect(margins.left).toBe(50); // min value
    });
  });

  describe('type definitions', () => {
    it('should export correct types', () => {
      // Test that types are properly defined by creating objects
      const marginConfig: MarginConfig = { top: 10, right: 10, bottom: 10, left: 10 };
      const dimensionConfig: DimensionConfig = { width: 100, height: 100 };
      const scaleConfig: ScaleConfig = { domainMin: 0, domainMax: 10, rangeMin: 0, rangeMax: 100 };
      const gridConfig: GridConfig = { x: [0, 1, 2], y: [0, 5, 10] };
      const axisLabelConfig: AxisLabelConfig = {
        xLabel: 'test',
        yLabel: 'test',
        xPosition: { x: 0, y: 0 },
        yPosition: { x: 0, y: 0 }
      };

      expect(marginConfig).toBeDefined();
      expect(dimensionConfig).toBeDefined();
      expect(scaleConfig).toBeDefined();
      expect(gridConfig).toBeDefined();
      expect(axisLabelConfig).toBeDefined();
    });
  });
});
