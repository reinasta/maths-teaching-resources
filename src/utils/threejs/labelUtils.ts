// Label creation and management utilities
import { 
  Group, 
  Scene, 
  LineDashedMaterial, 
  Vector3, 
  BufferGeometry, 
  Line 
} from './imports';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

export interface LabelConfig {
  showVolume: boolean;
  showSurfaceArea: boolean;
  showFaces: boolean;
}

export type LabelClassName = 'annotation' | 'label' | 'face-label';

/**
 * Finds or creates a labels group in the scene
 */
export function getOrCreateLabelsGroup(scene: Scene, groupName: string = 'labelsGroup'): Group {
  let labelsGroup = scene.children.find(child => 
    child instanceof Group && child.name === groupName
  ) as Group;
  
  if (!labelsGroup) {
    labelsGroup = new Group();
    labelsGroup.name = groupName;
    scene.add(labelsGroup);
  }
  
  return labelsGroup;
}

/**
 * Clears all existing labels from a labels group
 */
export function clearLabelsGroup(labelsGroup: Group): void {
  while (labelsGroup.children.length > 0) {
    const child = labelsGroup.children[0];
    labelsGroup.remove(child);
    
    if (child instanceof CSS2DObject) {
      if (child.element && child.element.parentNode) {
        child.element.parentNode.removeChild(child.element);
      }
    }
  }
}

/**
 * Creates a styled label element for triangular prisms
 */
export function createTriangularPrismLabel(
  position: Vector3, 
  text: string, 
  color?: string
): CSS2DObject {
  const div = document.createElement('div');
  div.className = 'annotation';
  div.textContent = text;
  div.style.backgroundColor = color || 'rgba(255, 255, 255, 0.8)';
  div.style.color = 'black';
  div.style.padding = '2px 6px';
  div.style.borderRadius = '4px';
  div.style.fontSize = '0.8em';
  div.style.pointerEvents = 'none';
  div.style.border = '1px solid rgba(0,0,0,0.3)';

  const label = new CSS2DObject(div);
  label.position.copy(position);
  
  return label;
}

/**
 * Creates a styled label element for trapezoidal prisms
 */
export function createTrapezoidalPrismLabel(
  position: Vector3, 
  text: string, 
  color: string = '#333333', 
  className: LabelClassName = 'label', 
  offset?: Vector3
): CSS2DObject {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  div.style.color = color;
  div.style.fontSize = '12px';
  div.style.fontFamily = 'Arial, sans-serif';
  div.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
  div.style.padding = '2px 5px';
  div.style.borderRadius = '3px';
  div.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  div.style.pointerEvents = 'none';

  const label = new CSS2DObject(div);
  if (offset) {
    // Calculate final position by adding offset to position
    const finalPosition = new Vector3(
      position.x + offset.x,
      position.y + offset.y,
      position.z + offset.z
    );
    label.position.copy(finalPosition);
  } else {
    label.position.copy(position);
  }
  
  return label;
}

/**
 * Creates a dashed line material for height indicators
 */
export function createDashedLineMaterial(
  visualStyle: 'solid' | 'wireframe' | 'colored',
  baseColor: number = 0x888888
): LineDashedMaterial {
  const lineColor = visualStyle === 'wireframe' ? 0x222222 : baseColor;
  const lineOpacity = visualStyle === 'wireframe' ? 1.0 : 0.8;

  return new LineDashedMaterial({
    color: lineColor,
    opacity: lineOpacity,
    transparent: true,
    dashSize: 0.1,
    gapSize: 0.05,
    linewidth: 1,
  });
}

/**
 * Manages labels group lifecycle - setup and cleanup
 */
export function setupLabelsGroup(scene: Scene, groupName: string = 'labelsGroup'): Group {
  const labelsGroup = getOrCreateLabelsGroup(scene, groupName);
  clearLabelsGroup(labelsGroup);
  return labelsGroup;
}

/**
 * Checks if any labels should be shown based on label configuration
 */
export function shouldShowLabels(labelConfig: LabelConfig): boolean {
  return labelConfig.showVolume || labelConfig.showSurfaceArea || labelConfig.showFaces;
}
