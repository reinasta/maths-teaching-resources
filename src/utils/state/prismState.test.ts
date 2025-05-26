/**
 * Test suite for prism state management pure functions
 */

import {
  validateTriangularPrismDimensions,
  updateTriangularPrismDimensions,
  sanitizeDimensionInput,
  createDefaultTriangularPrismDimensions,
  validateTrapezoidalPrismDimensions,
  updateTrapezoidalPrismDimensions,
  createDefaultTrapezoidalPrismDimensions,
  toggleUnfoldState,
  setUnfoldState,
  createDefaultUnfoldState,
  updateLabelConfig,
  toggleLabelConfigProperty,
  createDefaultLabelConfig,
  generateDimensionErrorMessage,
  type PrismDimensions,
  type TrapezoidalPrismDimensions,
  type LabelConfig,
  type UnfoldState
} from './prismState';

describe('Triangular Prism State Management', () => {
  describe('validateTriangularPrismDimensions', () => {
    it('should validate valid triangular prism dimensions', () => {
      const validDimensions: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 6
      };
      
      const result = validateTriangularPrismDimensions(validDimensions);
      
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
    
    it('should reject dimensions with non-positive values', () => {
      const invalidDimensions: PrismDimensions = {
        sideA: 0,
        sideB: 4,
        sideC: 5,
        height: 6
      };
      
      const result = validateTriangularPrismDimensions(invalidDimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('All dimensions must be positive numbers');
    });
    
    it('should reject dimensions that violate triangle inequality', () => {
      const invalidDimensions: PrismDimensions = {
        sideA: 1,
        sideB: 2,
        sideC: 5, // 1 + 2 = 3 < 5, violates triangle inequality
        height: 6
      };
      
      const result = validateTriangularPrismDimensions(invalidDimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Triangle sides must satisfy triangle inequality theorem');
    });
  });

  describe('updateTriangularPrismDimensions', () => {
    const baseDimensions: PrismDimensions = {
      sideA: 3,
      sideB: 4,
      sideC: 5,
      height: 6
    };
    
    it('should update valid dimensions', () => {
      const updates = { sideA: 6 };
      
      const result = updateTriangularPrismDimensions(baseDimensions, updates);
      
      expect(result.isValid).toBe(true);
      expect(result.dimensions).toEqual({
        sideA: 6,
        sideB: 4,
        sideC: 5,
        height: 6
      });
      expect(result.errorMessage).toBeUndefined();
    });
    
    it('should reject invalid updates and return original dimensions', () => {
      const invalidUpdates = { sideA: 10 }; // 10 + 4 = 14 > 5, but 4 + 5 = 9 < 10
      
      const result = updateTriangularPrismDimensions(baseDimensions, invalidUpdates);
      
      expect(result.isValid).toBe(false);
      expect(result.dimensions).toEqual(baseDimensions);
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe('sanitizeDimensionInput', () => {
    it('should parse valid string numbers', () => {
      expect(sanitizeDimensionInput('3.5')).toBe(3.5);
      expect(sanitizeDimensionInput('10')).toBe(10);
    });
    
    it('should pass through valid numbers', () => {
      expect(sanitizeDimensionInput(5.5)).toBe(5.5);
      expect(sanitizeDimensionInput(2)).toBe(2);
    });
    
    it('should return minimum for invalid inputs', () => {
      expect(sanitizeDimensionInput('invalid')).toBe(0.1);
      expect(sanitizeDimensionInput('')).toBe(0.1);
      expect(sanitizeDimensionInput(NaN)).toBe(0.1);
    });
    
    it('should clamp values to minimum', () => {
      expect(sanitizeDimensionInput(-5)).toBe(0.1);
      expect(sanitizeDimensionInput(0)).toBe(0.1);
    });
    
    it('should clamp values to maximum', () => {
      expect(sanitizeDimensionInput(15)).toBe(10);
      expect(sanitizeDimensionInput(100)).toBe(10);
    });
  });

  describe('createDefaultTriangularPrismDimensions', () => {
    it('should create valid default dimensions', () => {
      const defaultDimensions = createDefaultTriangularPrismDimensions();
      
      expect(defaultDimensions).toEqual({
        sideA: 3,
        sideB: 3,
        sideC: 3,
        height: 3
      });
      
      // Verify that defaults are valid
      const validation = validateTriangularPrismDimensions(defaultDimensions);
      expect(validation.isValid).toBe(true);
    });
  });
});

describe('Trapezoidal Prism State Management', () => {
  describe('validateTrapezoidalPrismDimensions', () => {
    it('should validate valid trapezoidal prism dimensions', () => {
      const validDimensions: TrapezoidalPrismDimensions = {
        topWidth: 2,
        bottomWidth: 3,
        height: 2,
        depth: 2
      };
      
      const result = validateTrapezoidalPrismDimensions(validDimensions);
      
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
    
    it('should reject dimensions with non-positive values', () => {
      const invalidDimensions: TrapezoidalPrismDimensions = {
        topWidth: 0,
        bottomWidth: 3,
        height: 2,
        depth: 2
      };
      
      const result = validateTrapezoidalPrismDimensions(invalidDimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('All dimensions must be positive numbers');
    });
    
    it('should reject dimensions with extreme width ratios', () => {
      const invalidDimensions: TrapezoidalPrismDimensions = {
        topWidth: 1,
        bottomWidth: 15, // 15:1 ratio > 10:1 threshold
        height: 2,
        depth: 2
      };
      
      const result = validateTrapezoidalPrismDimensions(invalidDimensions);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Width ratio is too extreme for a stable prism shape');
    });
  });

  describe('updateTrapezoidalPrismDimensions', () => {
    const baseDimensions: TrapezoidalPrismDimensions = {
      topWidth: 2,
      bottomWidth: 3,
      height: 2,
      depth: 2
    };
    
    it('should update valid dimensions', () => {
      const updates = { topWidth: 2.5 };
      
      const result = updateTrapezoidalPrismDimensions(baseDimensions, updates);
      
      expect(result.isValid).toBe(true);
      expect(result.dimensions).toEqual({
        topWidth: 2.5,
        bottomWidth: 3,
        height: 2,
        depth: 2
      });
      expect(result.errorMessage).toBeUndefined();
    });
    
    it('should reject invalid updates and return original dimensions', () => {
      const invalidUpdates = { topWidth: -1 };
      
      const result = updateTrapezoidalPrismDimensions(baseDimensions, invalidUpdates);
      
      expect(result.isValid).toBe(false);
      expect(result.dimensions).toEqual(baseDimensions);
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe('createDefaultTrapezoidalPrismDimensions', () => {
    it('should create valid default dimensions', () => {
      const defaultDimensions = createDefaultTrapezoidalPrismDimensions();
      
      expect(defaultDimensions).toEqual({
        topWidth: 2,
        bottomWidth: 3,
        height: 2,
        depth: 2
      });
      
      // Verify that defaults are valid
      const validation = validateTrapezoidalPrismDimensions(defaultDimensions);
      expect(validation.isValid).toBe(true);
    });
  });
});

describe('Unfold State Management', () => {
  describe('toggleUnfoldState', () => {
    it('should toggle unfold state from false to true', () => {
      const currentState: UnfoldState = { isUnfolded: false };
      
      const result = toggleUnfoldState(currentState);
      
      expect(result.isUnfolded).toBe(true);
    });
    
    it('should toggle unfold state from true to false', () => {
      const currentState: UnfoldState = { isUnfolded: true };
      
      const result = toggleUnfoldState(currentState);
      
      expect(result.isUnfolded).toBe(false);
    });
    
    it('should not mutate original state', () => {
      const currentState: UnfoldState = { isUnfolded: false };
      
      toggleUnfoldState(currentState);
      
      expect(currentState.isUnfolded).toBe(false);
    });
  });

  describe('setUnfoldState', () => {
    it('should set unfold state to true', () => {
      const currentState: UnfoldState = { isUnfolded: false };
      
      const result = setUnfoldState(currentState, true);
      
      expect(result.isUnfolded).toBe(true);
    });
    
    it('should set unfold state to false', () => {
      const currentState: UnfoldState = { isUnfolded: true };
      
      const result = setUnfoldState(currentState, false);
      
      expect(result.isUnfolded).toBe(false);
    });
  });

  describe('createDefaultUnfoldState', () => {
    it('should create default unfold state', () => {
      const defaultState = createDefaultUnfoldState();
      
      expect(defaultState).toEqual({ isUnfolded: false });
    });
  });
});

describe('Label Configuration Management', () => {
  describe('updateLabelConfig', () => {
    const baseLabelConfig: LabelConfig = {
      showVolume: true,
      showSurfaceArea: false,
      showFaces: false
    };
    
    it('should update label configuration with partial updates', () => {
      const updates = { showSurfaceArea: true };
      
      const result = updateLabelConfig(baseLabelConfig, updates);
      
      expect(result).toEqual({
        showVolume: true,
        showSurfaceArea: true,
        showFaces: false
      });
    });
    
    it('should update multiple properties', () => {
      const updates = { showSurfaceArea: true, showFaces: true };
      
      const result = updateLabelConfig(baseLabelConfig, updates);
      
      expect(result).toEqual({
        showVolume: true,
        showSurfaceArea: true,
        showFaces: true
      });
    });
    
    it('should not mutate original configuration', () => {
      const updates = { showSurfaceArea: true };
      
      updateLabelConfig(baseLabelConfig, updates);
      
      expect(baseLabelConfig.showSurfaceArea).toBe(false);
    });
  });

  describe('toggleLabelConfigProperty', () => {
    const baseLabelConfig: LabelConfig = {
      showVolume: true,
      showSurfaceArea: false,
      showFaces: false
    };
    
    it('should toggle showVolume property', () => {
      const result = toggleLabelConfigProperty(baseLabelConfig, 'showVolume');
      
      expect(result.showVolume).toBe(false);
      expect(result.showSurfaceArea).toBe(false);
      expect(result.showFaces).toBe(false);
    });
    
    it('should toggle showSurfaceArea property', () => {
      const result = toggleLabelConfigProperty(baseLabelConfig, 'showSurfaceArea');
      
      expect(result.showVolume).toBe(true);
      expect(result.showSurfaceArea).toBe(true);
      expect(result.showFaces).toBe(false);
    });
    
    it('should toggle showFaces property', () => {
      const result = toggleLabelConfigProperty(baseLabelConfig, 'showFaces');
      
      expect(result.showVolume).toBe(true);
      expect(result.showSurfaceArea).toBe(false);
      expect(result.showFaces).toBe(true);
    });
  });

  describe('createDefaultLabelConfig', () => {
    it('should create default label configuration', () => {
      const defaultConfig = createDefaultLabelConfig();
      
      expect(defaultConfig).toEqual({
        showVolume: true,
        showSurfaceArea: false,
        showFaces: false
      });
    });
  });
});

describe('Error Message Utilities', () => {
  describe('generateDimensionErrorMessage', () => {
    it('should generate error message for invalid triangular prism', () => {
      const invalidDimensions: PrismDimensions = {
        sideA: 1,
        sideB: 2,
        sideC: 5,
        height: 3
      };
      
      const result = generateDimensionErrorMessage(invalidDimensions, 'triangular');
      
      expect(result).toBe('Invalid triangle: sides 1, 2, 5 do not form a valid triangle. Each side must be shorter than the sum of the other two.');
    });
    
    it('should generate error message for invalid trapezoidal prism', () => {
      const invalidDimensions: TrapezoidalPrismDimensions = {
        topWidth: -1,
        bottomWidth: 3,
        height: 2,
        depth: 2
      };
      
      const result = generateDimensionErrorMessage(invalidDimensions, 'trapezoidal');
      
      expect(result).toBe('Invalid trapezoidal prism: dimensions -1, 3, 2, 2 must all be positive numbers.');
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complete triangular prism workflow', () => {
    // Start with defaults
    const defaultDimensions = createDefaultTriangularPrismDimensions();
    const defaultUnfoldState = createDefaultUnfoldState();
    const defaultLabelConfig = createDefaultLabelConfig();
    
    // Update dimensions
    const dimensionUpdate = updateTriangularPrismDimensions(defaultDimensions, { sideA: 4 });
    expect(dimensionUpdate.isValid).toBe(true);
    
    // Toggle unfold state
    const newUnfoldState = toggleUnfoldState(defaultUnfoldState);
    expect(newUnfoldState.isUnfolded).toBe(true);
    
    // Update label config
    const newLabelConfig = toggleLabelConfigProperty(defaultLabelConfig, 'showSurfaceArea');
    expect(newLabelConfig.showSurfaceArea).toBe(true);
  });
  
  it('should handle complete trapezoidal prism workflow', () => {
    // Start with defaults
    const defaultDimensions = createDefaultTrapezoidalPrismDimensions();
    const defaultUnfoldState = createDefaultUnfoldState();
    const defaultLabelConfig = createDefaultLabelConfig();
    
    // Update dimensions
    const dimensionUpdate = updateTrapezoidalPrismDimensions(defaultDimensions, { topWidth: 2.5 });
    expect(dimensionUpdate.isValid).toBe(true);
    
    // Set unfold state
    const newUnfoldState = setUnfoldState(defaultUnfoldState, true);
    expect(newUnfoldState.isUnfolded).toBe(true);
    
    // Update label config
    const newLabelConfig = updateLabelConfig(defaultLabelConfig, { showFaces: true });
    expect(newLabelConfig.showFaces).toBe(true);
  });
});
