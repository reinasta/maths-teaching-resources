/**
 * D3 Coordinate Calculation Utilities
 * 
 * Pure functions for D3.js coordinate system calculations including responsive margins,
 * font sizing, scale creation, and axis positioning. These functions are extracted
 * to improve testability and provide consistent coordinate calculations across
 * different D3 visualization components.
 * 
 * @module D3CoordinateCalculations
 */

/**
 * Margin configuration for D3 visualizations
 */
export interface MarginConfig {
  /** Top margin in pixels */
  top: number;
  /** Right margin in pixels */
  right: number;
  /** Bottom margin in pixels */
  bottom: number;
  /** Left margin in pixels */
  left: number;
}

/**
 * Dimension configuration for D3 visualizations
 */
export interface DimensionConfig {
  /** Total width of the visualization */
  width: number;
  /** Total height of the visualization */
  height: number;
}

/**
 * Scale domain and range configuration
 */
export interface ScaleConfig {
  /** Domain minimum value */
  domainMin: number;
  /** Domain maximum value */
  domainMax: number;
  /** Range minimum value (usually 0) */
  rangeMin: number;
  /** Range maximum value */
  rangeMax: number;
}

/**
 * Grid configuration for coordinate planes
 */
export interface GridConfig {
  /** Grid lines for x-axis */
  x: number[];
  /** Grid lines for y-axis */
  y: number[];
}

/**
 * Axis label positioning configuration
 */
export interface AxisLabelConfig {
  /** X-axis label text */
  xLabel: string;
  /** Y-axis label text */
  yLabel: string;
  /** X-axis label position */
  xPosition: { x: number; y: number };
  /** Y-axis label position */
  yPosition: { x: number; y: number };
}

/**
 * Calculate responsive margins based on visualization dimensions.
 * 
 * This function ensures margins scale appropriately with the visualization size
 * while maintaining minimum readable spacing and maximum constraints for very
 * large visualizations.
 * 
 * @param width - Total width of the visualization
 * @param height - Total height of the visualization
 * @param minMargins - Minimum margins to ensure readability
 * @param marginPercentages - Margin percentages relative to dimensions
 * @returns Calculated margin configuration
 * 
 * @example
 * ```typescript
 * const margins = calculateResponsiveMargins(800, 600);
 * // Returns: { top: 60, right: 40, bottom: 72, left: 80 }
 * 
 * const customMargins = calculateResponsiveMargins(800, 600, 
 *   { top: 30, right: 15, bottom: 30, left: 30 },
 *   { top: 0.08, right: 0.04, bottom: 0.08, left: 0.06 }
 * );
 * ```
 */
export function calculateResponsiveMargins(
  width: number,
  height: number,
  minMargins: Partial<MarginConfig> = {},
  marginPercentages: Partial<MarginConfig> = {}
): MarginConfig {
  // Default minimum margins for readability
  const defaultMinMargins = {
    top: 45,
    right: 25,
    bottom: 50,
    left: 50,
    ...minMargins
  };

  // Default margin percentages
  const defaultPercentages = {
    top: 0.1,
    right: 0.05,
    bottom: 0.12,
    left: 0.1,
    ...marginPercentages
  };

  return {
    top: Math.max(defaultMinMargins.top, height * defaultPercentages.top),
    right: Math.max(defaultMinMargins.right, width * defaultPercentages.right),
    bottom: Math.max(defaultMinMargins.bottom, height * defaultPercentages.bottom),
    left: Math.max(defaultMinMargins.left, width * defaultPercentages.left)
  };
}

/**
 * Calculate responsive font size based on visualization dimensions.
 * 
 * This function provides consistent font sizing across different screen sizes
 * while maintaining readability. Font size scales with the visualization but
 * is bounded by minimum and maximum constraints.
 * 
 * @param width - Width of the visualization
 * @param height - Height of the visualization
 * @param scaleFactor - Scaling factor (default: 0.025 = 2.5% of smallest dimension)
 * @param minSize - Minimum font size in pixels
 * @param maxSize - Maximum font size in pixels
 * @returns Calculated font size in pixels
 * 
 * @example
 * ```typescript
 * const fontSize = calculateResponsiveFontSize(800, 600);
 * // Returns: 15 (2.5% of 600px)
 * 
 * const largeFontSize = calculateResponsiveFontSize(800, 600, 0.035);
 * // Returns: 21 (3.5% of 600px)
 * ```
 */
export function calculateResponsiveFontSize(
  width: number,
  height: number,
  scaleFactor: number = 0.025,
  minSize: number = 10,
  maxSize: number = 24
): number {
  const calculatedSize = Math.min(width, height) * scaleFactor;
  return Math.max(minSize, Math.min(maxSize, calculatedSize));
}

/**
 * Calculate inner dimensions after accounting for margins.
 * 
 * @param dimensions - Total visualization dimensions
 * @param margins - Margin configuration
 * @returns Inner width and height available for content
 * 
 * @example
 * ```typescript
 * const inner = calculateInnerDimensions(
 *   { width: 800, height: 600 },
 *   { top: 50, right: 25, bottom: 50, left: 50 }
 * );
 * // Returns: { width: 725, height: 500 }
 * ```
 */
export function calculateInnerDimensions(
  dimensions: DimensionConfig,
  margins: MarginConfig
): DimensionConfig {
  return {
    width: dimensions.width - margins.left - margins.right,
    height: dimensions.height - margins.top - margins.bottom
  };
}

/**
 * Create scale configuration for linear scales.
 * 
 * This function simplifies the creation of D3 scale configurations by
 * providing a consistent interface for defining domain and range values.
 * 
 * @param domainMin - Minimum domain value
 * @param domainMax - Maximum domain value
 * @param rangeMin - Minimum range value (usually 0)
 * @param rangeMax - Maximum range value
 * @returns Scale configuration object
 * 
 * @example
 * ```typescript
 * const xScaleConfig = createScaleConfig(0, 10, 0, 750);
 * const yScaleConfig = createScaleConfig(0, 25, 500, 0); // Inverted for SVG
 * ```
 */
export function createScaleConfig(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number
): ScaleConfig {
  return {
    domainMin,
    domainMax,
    rangeMin,
    rangeMax
  };
}

/**
 * Calculate responsive tick sizes for axes.
 * 
 * Tick sizes scale with the visualization size to maintain proportional
 * appearance across different screen sizes.
 * 
 * @param width - Visualization width
 * @param scaleFactor - Scaling factor for tick size (default: 0.015)
 * @param minSize - Minimum tick size
 * @param maxSize - Maximum tick size
 * @returns Object with tick size and padding values
 * 
 * @example
 * ```typescript
 * const tickConfig = calculateResponsiveTickSizes(800);
 * // Returns: { tickSize: 12, tickPadding: 12 }
 * ```
 */
export function calculateResponsiveTickSizes(
  width: number,
  scaleFactor: number = 0.015,
  minSize: number = 6,
  maxSize: number = 12
): { tickSize: number; tickPadding: number } {
  const calculatedSize = width * scaleFactor;
  const tickSize = Math.min(maxSize, Math.max(minSize, calculatedSize));
  
  return {
    tickSize,
    tickPadding: tickSize // Usually tick padding equals tick size
  };
}

/**
 * Generate grid line positions for coordinate planes.
 * 
 * Creates arrays of positions for grid lines based on the specified step sizes
 * and ranges.
 * 
 * @param xMin - Minimum x value
 * @param xMax - Maximum x value
 * @param xStep - Step size for x grid lines
 * @param yMin - Minimum y value
 * @param yMax - Maximum y value
 * @param yStep - Step size for y grid lines
 * @returns Grid configuration with x and y line positions
 * 
 * @example
 * ```typescript
 * const grid = generateGridLines(0, 10, 1, 0, 30, 5);
 * // Returns: { x: [0,1,2,3,4,5,6,7,8,9,10], y: [0,5,10,15,20,25,30] }
 * ```
 */
export function generateGridLines(
  xMin: number,
  xMax: number,
  xStep: number,
  yMin: number,
  yMax: number,
  yStep: number
): GridConfig {
  const x: number[] = [];
  const y: number[] = [];

  // Generate x grid lines
  for (let i = xMin; i <= xMax; i += xStep) {
    x.push(i);
  }

  // Generate y grid lines
  for (let i = yMin; i <= yMax; i += yStep) {
    y.push(i);
  }

  return { x, y };
}

/**
 * Calculate axis label positions based on dimensions and margins.
 * 
 * Positions axis labels appropriately relative to the visualization area,
 * accounting for font sizes and proper spacing.
 * 
 * @param innerDimensions - Inner dimensions of the visualization
 * @param margins - Margin configuration
 * @param baseFontSize - Base font size for calculations
 * @param xLabel - X-axis label text
 * @param yLabel - Y-axis label text
 * @returns Axis label configuration with positions
 * 
 * @example
 * ```typescript
 * const labelConfig = calculateAxisLabelPositions(
 *   { width: 750, height: 500 },
 *   { top: 50, right: 25, bottom: 50, left: 50 },
 *   15,
 *   'inches',
 *   'centimetres'
 * );
 * ```
 */
export function calculateAxisLabelPositions(
  innerDimensions: DimensionConfig,
  margins: MarginConfig,
  baseFontSize: number,
  xLabel: string,
  yLabel: string
): AxisLabelConfig {
  return {
    xLabel,
    yLabel,
    xPosition: {
      x: innerDimensions.width / 2,
      y: innerDimensions.height + baseFontSize * 4
    },
    yPosition: {
      x: -(innerDimensions.height / 2),
      y: -margins.left + baseFontSize
    }
  };
}

/**
 * Calculate SVG viewBox string for responsive scaling.
 * 
 * Creates a properly formatted viewBox attribute value that enables
 * responsive scaling while maintaining aspect ratio.
 * 
 * @param width - SVG width
 * @param height - SVG height
 * @returns ViewBox string for SVG element
 * 
 * @example
 * ```typescript
 * const viewBox = calculateViewBox(800, 600);
 * // Returns: "0 0 800 600"
 * ```
 */
export function calculateViewBox(width: number, height: number): string {
  return `0 0 ${width} ${height}`;
}

/**
 * Calculate responsive margins for conversion graphs specifically.
 * 
 * Provides specialized margin calculations for conversion graph components
 * with appropriate defaults.
 * 
 * @param width - Graph width
 * @param height - Graph height
 * @returns Margin configuration optimized for conversion graphs
 */
export function calculateConversionGraphMargins(
  width: number,
  height: number
): MarginConfig {
  return calculateResponsiveMargins(
    width,
    height,
    { top: 40, right: 20, bottom: 40, left: 40 },
    { top: 0.1, right: 0.05, bottom: 0.1, left: 0.08 }
  );
}

/**
 * Calculate responsive margins for coordinate planes specifically.
 * 
 * Provides specialized margin calculations for coordinate plane components
 * with appropriate defaults.
 * 
 * @param width - Plane width
 * @param height - Plane height
 * @returns Margin configuration optimized for coordinate planes
 */
export function calculateCoordinatePlaneMargins(
  width: number,
  height: number
): MarginConfig {
  return calculateResponsiveMargins(
    width,
    height,
    { top: 45, right: 25, bottom: 50, left: 50 },
    { top: 0.1, right: 0.05, bottom: 0.12, left: 0.1 }
  );
}
