export interface TrapezoidalPrismDimensions {
  topWidth: number;
  bottomWidth: number;
  height: number;
  depth: number;
}

export type VisualStyle = 'solid' | 'colored' | 'wireframe';

export interface TrapezoidalPrismCalculations {
  leftSide: number;
  rightSide: number;
  surfaceArea: number;
  volume: number;
}