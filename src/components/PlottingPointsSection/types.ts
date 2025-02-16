// src/components/PlottingPointsSection/types.ts
export interface Point {
  coordinates: [number, number];
  label: string;
  type: 'example' | 'practice';
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface PointClickHandler {
  (index: number): void;
}