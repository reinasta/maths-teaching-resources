/**
 * Pure state management functions for prism components
 * 
 * This module provides pure functions for managing prism state including:
 * - Dimension updates with validation
 * - Unfold state management
 * - Label configuration updates
 * - Input sanitization and validation
 */

// Type imports
export interface PrismDimensions {
  sideA: number;
  sideB: number;
  sideC: number;
  height: number;
}

export interface TrapezoidalPrismDimensions {
  topWidth: number;
  bottomWidth: number;
  height: number;
  depth: number;
}

export interface LabelConfig {
  showVolume: boolean;
  showSurfaceArea: boolean;
  showFaces: boolean;
}

export interface UnfoldState {
  isUnfolded: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// ============================================================================
// Triangular Prism State Management
// ============================================================================

/**
 * Validates triangular prism dimensions using triangle inequality theorem
 * 
 * @param dimensions - The prism dimensions to validate
 * @returns Validation result with error message if invalid
 */
export function validateTriangularPrismDimensions(dimensions: PrismDimensions): ValidationResult {
  const { sideA, sideB, sideC, height } = dimensions;
  
  // Check for positive values
  if (sideA <= 0 || sideB <= 0 || sideC <= 0 || height <= 0) {
    return {
      isValid: false,
      errorMessage: 'All dimensions must be positive numbers'
    };
  }
  
  // Check triangle inequality theorem
  if (!(sideA + sideB > sideC && sideB + sideC > sideA && sideC + sideA > sideB)) {
    return {
      isValid: false,
      errorMessage: 'Triangle sides must satisfy triangle inequality theorem'
    };
  }
  
  return { isValid: true };
}

/**
 * Creates a new prism dimensions object with updated values and validation
 * 
 * @param currentDimensions - Current dimension state
 * @param updates - Partial updates to apply
 * @returns New dimensions object if valid, or current dimensions if invalid
 */
export function updateTriangularPrismDimensions(
  currentDimensions: PrismDimensions,
  updates: Partial<PrismDimensions>
): { dimensions: PrismDimensions; isValid: boolean; errorMessage?: string } {
  const newDimensions = { ...currentDimensions, ...updates };
  const validation = validateTriangularPrismDimensions(newDimensions);
  
  if (validation.isValid) {
    return { dimensions: newDimensions, isValid: true };
  } else {
    return { 
      dimensions: currentDimensions, 
      isValid: false, 
      errorMessage: validation.errorMessage 
    };
  }
}

/**
 * Sanitizes input value for dimension updates
 * 
 * @param value - Raw input value
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized numeric value
 */
export function sanitizeDimensionInput(value: string | number, min = 0.1, max = 10): number {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return min;
  }
  
  return Math.max(min, Math.min(max, numValue));
}

// ============================================================================
// Trapezoidal Prism State Management
// ============================================================================

/**
 * Validates trapezoidal prism dimensions
 * 
 * @param dimensions - The trapezoidal prism dimensions to validate
 * @returns Validation result with error message if invalid
 */
export function validateTrapezoidalPrismDimensions(dimensions: TrapezoidalPrismDimensions): ValidationResult {
  const { topWidth, bottomWidth, height, depth } = dimensions;
  
  // Check for positive values
  if (topWidth <= 0 || bottomWidth <= 0 || height <= 0 || depth <= 0) {
    return {
      isValid: false,
      errorMessage: 'All dimensions must be positive numbers'
    };
  }
  
  // Check that the prism maintains a reasonable shape
  const widthRatio = Math.max(topWidth, bottomWidth) / Math.min(topWidth, bottomWidth);
  if (widthRatio > 10) {
    return {
      isValid: false,
      errorMessage: 'Width ratio is too extreme for a stable prism shape'
    };
  }
  
  return { isValid: true };
}

/**
 * Creates a new trapezoidal prism dimensions object with updated values and validation
 * 
 * @param currentDimensions - Current dimension state
 * @param updates - Partial updates to apply
 * @returns New dimensions object if valid, or current dimensions if invalid
 */
export function updateTrapezoidalPrismDimensions(
  currentDimensions: TrapezoidalPrismDimensions,
  updates: Partial<TrapezoidalPrismDimensions>
): { dimensions: TrapezoidalPrismDimensions; isValid: boolean; errorMessage?: string } {
  const newDimensions = { ...currentDimensions, ...updates };
  const validation = validateTrapezoidalPrismDimensions(newDimensions);
  
  if (validation.isValid) {
    return { dimensions: newDimensions, isValid: true };
  } else {
    return { 
      dimensions: currentDimensions, 
      isValid: false, 
      errorMessage: validation.errorMessage 
    };
  }
}

// ============================================================================
// Unfold State Management
// ============================================================================

/**
 * Toggles the unfold state
 * 
 * @param currentState - Current unfold state
 * @returns New unfold state
 */
export function toggleUnfoldState(currentState: UnfoldState): UnfoldState {
  return { isUnfolded: !currentState.isUnfolded };
}

/**
 * Sets unfold state to a specific value
 * 
 * @param currentState - Current unfold state
 * @param isUnfolded - Target unfold state
 * @returns New unfold state
 */
export function setUnfoldState(currentState: UnfoldState, isUnfolded: boolean): UnfoldState {
  return { isUnfolded };
}

// ============================================================================
// Label Configuration Management
// ============================================================================

/**
 * Updates label configuration with new values
 * 
 * @param currentConfig - Current label configuration
 * @param updates - Partial updates to apply
 * @returns New label configuration
 */
export function updateLabelConfig(
  currentConfig: LabelConfig,
  updates: Partial<LabelConfig>
): LabelConfig {
  return { ...currentConfig, ...updates };
}

/**
 * Toggles a specific label configuration property
 * 
 * @param currentConfig - Current label configuration
 * @param key - Property to toggle
 * @returns New label configuration
 */
export function toggleLabelConfigProperty(
  currentConfig: LabelConfig,
  key: keyof LabelConfig
): LabelConfig {
  return { ...currentConfig, [key]: !currentConfig[key] };
}

/**
 * Creates default label configuration
 * 
 * @returns Default label configuration
 */
export function createDefaultLabelConfig(): LabelConfig {
  return {
    showVolume: true,
    showSurfaceArea: false,
    showFaces: false
  };
}

// ============================================================================
// State Transformation Utilities
// ============================================================================

/**
 * Creates default triangular prism dimensions
 * 
 * @returns Default triangular prism dimensions
 */
export function createDefaultTriangularPrismDimensions(): PrismDimensions {
  return {
    sideA: 3,
    sideB: 3,
    sideC: 3,
    height: 3
  };
}

/**
 * Creates default trapezoidal prism dimensions
 * 
 * @returns Default trapezoidal prism dimensions
 */
export function createDefaultTrapezoidalPrismDimensions(): TrapezoidalPrismDimensions {
  return {
    topWidth: 2,
    bottomWidth: 3,
    height: 2,
    depth: 2
  };
}

/**
 * Creates default unfold state
 * 
 * @returns Default unfold state
 */
export function createDefaultUnfoldState(): UnfoldState {
  return { isUnfolded: false };
}

// ============================================================================
// Error Message Utilities
// ============================================================================

/**
 * Generates user-friendly error messages for validation failures
 * 
 * @param dimensions - The dimensions that failed validation
 * @param type - The type of prism (triangular or trapezoidal)
 * @returns User-friendly error message
 */
export function generateDimensionErrorMessage(
  dimensions: PrismDimensions | TrapezoidalPrismDimensions,
  type: 'triangular' | 'trapezoidal'
): string {
  if (type === 'triangular') {
    const { sideA, sideB, sideC } = dimensions as PrismDimensions;
    return `Invalid triangle: sides ${sideA}, ${sideB}, ${sideC} do not form a valid triangle. Each side must be shorter than the sum of the other two.`;
  } else {
    const { topWidth, bottomWidth, height, depth } = dimensions as TrapezoidalPrismDimensions;
    return `Invalid trapezoidal prism: dimensions ${topWidth}, ${bottomWidth}, ${height}, ${depth} must all be positive numbers.`;
  }
}
