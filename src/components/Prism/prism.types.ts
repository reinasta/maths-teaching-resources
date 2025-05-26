export type VisualStyle = 'solid' | 'colored' | 'wireframe';
export type LabelCategory = 'volume' | 'surfaceArea' | 'faces';

export interface LabelConfig {
  showVolume: boolean;      // Edge lengths and height needed for volume calculation
  showSurfaceArea: boolean; // Additional measurements for surface area calculation
  showFaces: boolean;       // Face identification labels
}

export interface PrismDimensions {
  sideA: number;
  sideB: number;
  sideC: number;
  height: number;
}

export interface PrismProps {
  dimensions: PrismDimensions;
  isUnfolded?: boolean;
  visualStyle?: VisualStyle;
  labelConfig?: LabelConfig; // New prop for label configuration
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  showVolume: true,
  showSurfaceArea: false,
  showFaces: false
};
