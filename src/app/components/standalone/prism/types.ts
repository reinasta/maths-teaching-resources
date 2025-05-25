export interface PrismDimensions {
  sideA: number;
  sideB: number;
  sideC: number;
  height: number;
}

export interface PrismCalculations {
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
  isValid: boolean;
}

export interface TrapezoidalPrismDimensions {
  topWidth: number;
  bottomWidth: number;
  height: number;
  depth: number;
}

// Define and export LabelConfig
export interface LabelConfig {
  showVolume: boolean;
  showSurfaceArea: boolean;
  showFaces: boolean;
}