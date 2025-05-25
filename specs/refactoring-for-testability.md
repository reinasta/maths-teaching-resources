# Refactoring for Testability - Modular Architecture Plan

> **Goal**: Make the codebase more modular with pure functions to improve testability and debugging while maintaining compatibility with existing tests.

## Overview

This refactoring plan transforms our mathematics education platform into a more modular architecture with pure functions. Each phase can be implemented independently and verified with existing tests.

## Refactoring Plan: Modular Architecture with Pure Functions

### **Phase 1: Extract Pure Calculation Functions** *(Week 1-2)*

#### 1.1 Create Utility Function Modules ✅ **COMPLETED**
- [x] **Trapezoidal Prism Calculations** - `src/utils/trapezoidalPrismCalculations.ts`
  - [x] Extract `calculateVolume()` - Pure function for volume calculation
  - [x] Extract `calculateTrapezoidalFaceArea()` - Pure function for face area
  - [x] Extract `calculateSideLength()` - Pure function for side length using Pythagorean theorem
  - [x] Extract `calculateSurfaceArea()` - Pure function for total surface area
  - [x] Keep `calculateTrapezoidalPrismValues()` as composite function for backward compatibility
  - [x] Add comprehensive JSDoc documentation with mathematical formulas
  - [x] Expand test suite from 2 to 7 tests covering all pure functions
  - [x] Verify integration with existing components (`TrapezoidalPrismPage`)

#### 1.2 Extract Triangle Prism Calculations ✅ **COMPLETED**
- [x] **Triangular Prism Calculations** - `src/utils/geometry/triangularPrism.ts`
  - [x] Extract `calculateTriangleArea()` - Heron's formula implementation
  - [x] Extract `calculateTriangleHeight()` - Height calculation from area and base
  - [x] Extract `validateTriangleInequality()` - Triangle validity checker
  - [x] Extract volume and surface area calculations
  - [x] Create comprehensive test suite
  - [x] Update `usePrismCalculations` hook to use pure functions

### **Phase 2: Extract D3/Three.js Pure Functions** *(Week 3-4)*

#### 2.1 D3 Coordinate Calculations ✅ **COMPLETED**
- [x] **D3 Coordinate Calculations** - `src/utils/d3/coordinateCalculations.ts`
  - [x] Extract `calculateResponsiveMargins()` - Responsive margin calculations with customizable minimums
  - [x] Extract `calculateResponsiveFontSize()` - Font size based on dimensions with min/max constraints
  - [x] Extract `calculateInnerDimensions()` - Inner dimension calculations subtracting margins
  - [x] Extract `createScaleConfig()` - D3 scale configuration objects
  - [x] Extract `calculateResponsiveTickSizes()` - Responsive tick sizing for axes
  - [x] Extract `generateGridLines()` - Grid line generation with custom steps
  - [x] Extract `calculateAxisLabelPositions()` - Axis label positioning calculations
  - [x] Extract `calculateViewBox()` - SVG viewBox string generation
  - [x] Extract `calculateConversionGraphMargins()` - Conversion graph specific margins
  - [x] Extract `calculateCoordinatePlaneMargins()` - Coordinate plane specific margins
  - [x] Comprehensive test suite with 37 tests covering all functions and edge cases
  - [x] Update ConversionGraph component to use pure functions
  - [x] Update CoordinatePlane component to use pure functions

#### 2.2 Three.js Geometry Calculations
- [ ] **3D Geometry Utils** - `src/utils/three/geometry.ts`
  - [ ] Extract `calculateTriangleVertices()` - Triangle vertex positioning
  - [ ] Extract `calculateLabelPositions()` - 3D label positioning
  - [ ] Extract camera positioning calculations
  - [ ] Extract mesh transformation functions
  - [ ] Create unit tests for 3D calculations

### **Phase 3: Extract Component Logic** *(Week 5-6)*

#### 3.1 State Management Pure Functions
- [ ] **State Management** - `src/utils/state/prismState.ts`
  - [ ] Extract `updatePrismDimensions()` - State update with validation
  - [ ] Extract `toggleUnfoldState()` - State toggle functions
  - [ ] Extract state validation functions
  - [ ] Create immutable state update patterns
  - [ ] Test state transformation functions

#### 3.2 Validation Functions
- [ ] **Validation Utils** - `src/utils/validation/geometry.ts`
  - [ ] Extract `validateDimensions()` - Dimension validation
  - [ ] Extract input sanitization functions
  - [ ] Extract error message generation
  - [ ] Create comprehensive validation test suite

### **Phase 4: Refactor Components to Use Pure Functions** *(Week 7-8)*

#### 4.1 Update Control Components
- [ ] **PrismControls Refactor**
  - [ ] Update `PrismControls` to use pure validation functions
  - [ ] Update `TrapezoidalPrismControls` to use pure state functions
  - [ ] Implement pure event handlers
  - [ ] Test component integration with pure functions

#### 4.2 Update Visualization Components
- [ ] **Prism Components Refactor**
  - [ ] Update `TrapezoidalPrism` to use pure geometry functions
  - [ ] Update `Prism` to use pure Three.js calculations
  - [ ] Separate rendering logic from calculation logic
  - [ ] Test visualization accuracy with pure functions

### **Phase 5: Add Comprehensive Tests** *(Week 9-10)*

#### 5.1 Test Pure Functions
- [ ] **Individual Function Tests**
  - [ ] Test all calculation functions with edge cases
  - [ ] Test validation functions with invalid inputs
  - [ ] Test state functions with various scenarios
  - [ ] Add performance benchmarks for critical calculations

#### 5.2 Integration Tests
- [ ] **Component Integration Tests**
  - [ ] Test component behavior with pure functions
  - [ ] Test error handling and validation flows
  - [ ] Test mathematical accuracy across the application
  - [ ] Add visual regression tests for 3D components

## Implementation Strategy

### **Principles**
1. **Start Small**: Begin with Phase 1.1 (already completed successfully)
2. **Test-Driven**: Run existing tests after each change to verify compatibility
3. **Incremental**: Each phase can be implemented and tested independently
4. **Backward Compatible**: Keep existing APIs until all components are refactored

### **Benefits Achieved So Far**
- **🧪 More testable**: Calculations can be tested in isolation
- **🐛 Easier to debug**: Issues can be traced to specific functions
- **♻️ More reusable**: Functions can be used across different components
- **📚 Better documented**: Clear function descriptions with mathematical formulas
- **🔒 Type safe**: All functions have proper TypeScript interfaces
- **⚡ Performance**: Easier to memoize pure functions

## Next Steps

**Ready for Phase 2.2**: Extract Three.js geometry calculations for 3D visualization improvements.

**Alternative**: Move to **Phase 3.1** to extract state management pure functions if component logic improvements are preferred.

---

## Completed Work Log

### 2025-05-25: Phase 1.1 Completed ✅
- **Files Modified**:
  - `src/utils/trapezoidalPrismCalculations.ts` - Extracted 4 pure functions
  - `src/utils/trapezoidalPrismCalculations.test.ts` - Expanded test suite to 7 tests
- **Functions Created**:
  - `calculateVolume()` - Volume calculation with formula documentation
  - `calculateTrapezoidalFaceArea()` - Face area calculation
  - `calculateSideLength()` - Side length using Pythagorean theorem
  - `calculateSurfaceArea()` - Total surface area calculation
- **Tests Verified**: All existing integration tests pass, new unit tests added
- **Backward Compatibility**: ✅ Maintained - `calculateTrapezoidalPrismValues()` unchanged API

### 2025-05-25: Phase 1.2 Completed ✅
- **Files Created**:
  - `src/utils/geometry/triangularPrism.ts` - Extracted 5 pure functions + 1 composite
  - `src/utils/geometry/triangularPrism.test.ts` - Comprehensive test suite with 11 tests
- **Files Modified**:
  - `src/app/components/standalone/prism/hooks/usePrismCalculations.ts` - Updated to use pure functions
- **Functions Created**:
  - `validateTriangleInequality()` - Triangle validity checker using triangle inequality theorem
  - `calculateTriangleArea()` - Heron's formula implementation with error handling
  - `calculateTriangleHeight()` - Height calculation from area and base
  - `calculateVolume()` - Pure volume calculation
  - `calculateSurfaceArea()` - Pure surface area calculation
  - `calculateTriangularPrismValues()` - Composite function for backward compatibility
- **Tests Verified**: All existing tests pass (40 total), new 11 unit tests added
- **Backward Compatibility**: ✅ Maintained - `usePrismCalculations` hook API unchanged

### 2025-05-25: Phase 2.1 Completed ✅
- **Files Created**:
  - `src/utils/d3/coordinateCalculations.ts` - Extracted 12 pure D3 coordinate functions
  - `src/utils/d3/coordinateCalculations.test.ts` - Comprehensive test suite with 37 tests
- **Files Modified**:
  - `src/components/ConversionGraph/ConversionGraph.tsx` - Updated to use pure D3 functions
  - `src/components/CoordinatePlane/CoordinatePlane.tsx` - Updated to use pure D3 functions
- **Functions Created**:
  - `calculateResponsiveMargins()` - Responsive margin calculations with customizable minimums and percentages
  - `calculateResponsiveFontSize()` - Font size calculation based on dimensions with min/max constraints
  - `calculateInnerDimensions()` - Inner dimension calculations by subtracting margins
  - `createScaleConfig()` - D3 scale configuration object creation
  - `calculateResponsiveTickSizes()` - Responsive tick and padding size calculations
  - `generateGridLines()` - Grid line array generation with custom steps and ranges
  - `calculateAxisLabelPositions()` - Axis label positioning with font size adjustments
  - `calculateViewBox()` - SVG viewBox string generation
  - `calculateConversionGraphMargins()` - Conversion graph specific margin calculations
  - `calculateCoordinatePlaneMargins()` - Coordinate plane specific margin calculations
- **Type Definitions Created**:
  - `MarginConfig` - Interface for margin configurations
  - `DimensionConfig` - Interface for width/height dimensions
  - `ScaleConfig` - Interface for D3 scale configurations
  - `GridConfig` - Interface for grid line configurations
  - `AxisLabelConfig` - Interface for axis label positioning
- **Tests Verified**: All existing tests pass, new 37 unit tests added covering edge cases, responsive behavior, and mathematical accuracy
- **Backward Compatibility**: ✅ Maintained - Component APIs unchanged, D3 rendering behavior preserved