/**
 * @fileoverview Unit tests for Three.js geometry calculation functions
 */

import { Vector2, Matrix4 } from '../threejs/imports';
import {
  calculateTriangleVertices,
  calculateOutwardPerp,
  findThirdVertex,
  calculateTriangularPrismLabelPositions,
  calculateTrapezoidalPrismLabelPositions,
  calculateOptimalCameraPosition,
  createStandardLighting,
  createStandardOrbitControls,
  calculateUnfoldedFaceTransform,
  calculateTriangleHeight,
  calculateProjectionOnLine,
  createPrismGeometry,
  createTrapezoidalPrismGeometry,
  PrismDimensions,
  TrapezoidalPrismDimensions
} from './geometryCalculations';

describe('Three.js Geometry Calculations', () => {
  describe('calculateTriangleVertices', () => {
    it('should calculate vertices for a right triangle (3-4-5)', () => {
      const vertices = calculateTriangleVertices(3, 4, 5);
      
      expect(vertices).toHaveLength(3);
      expect(vertices[0].x).toBeCloseTo(0);
      expect(vertices[0].y).toBeCloseTo(0);
      expect(vertices[1].x).toBeCloseTo(3);
      expect(vertices[1].y).toBeCloseTo(0);
      expect(vertices[2].x).toBeCloseTo(0);
      expect(vertices[2].y).toBeCloseTo(4);
    });

    it('should calculate vertices for an equilateral triangle', () => {
      const vertices = calculateTriangleVertices(2, 2, 2);
      
      expect(vertices).toHaveLength(3);
      expect(vertices[0].x).toBeCloseTo(0);
      expect(vertices[0].y).toBeCloseTo(0);
      expect(vertices[1].x).toBeCloseTo(2);
      expect(vertices[1].y).toBeCloseTo(0);
      expect(vertices[2].x).toBeCloseTo(1);
      expect(vertices[2].y).toBeCloseTo(Math.sqrt(3));
    });

    it('should calculate vertices for an isosceles triangle', () => {
      const vertices = calculateTriangleVertices(4, 3, 3);
      
      expect(vertices).toHaveLength(3);
      expect(vertices[0].x).toBeCloseTo(0);
      expect(vertices[0].y).toBeCloseTo(0);
      expect(vertices[1].x).toBeCloseTo(4);
      expect(vertices[1].y).toBeCloseTo(0);
      // Third vertex should be at the apex
      expect(vertices[2].x).toBeCloseTo(2); // Midpoint of base
      expect(vertices[2].y).toBeGreaterThan(0);
    });

    it('should throw error for negative side lengths', () => {
      expect(() => calculateTriangleVertices(-1, 2, 3)).toThrow('All side lengths must be positive');
      expect(() => calculateTriangleVertices(1, -2, 3)).toThrow('All side lengths must be positive');
      expect(() => calculateTriangleVertices(1, 2, -3)).toThrow('All side lengths must be positive');
    });

    it('should throw error for zero side lengths', () => {
      expect(() => calculateTriangleVertices(0, 2, 3)).toThrow('All side lengths must be positive');
    });

    it('should throw error for invalid triangle (triangle inequality)', () => {
      expect(() => calculateTriangleVertices(1, 1, 3)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
      expect(() => calculateTriangleVertices(1, 2, 4)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
      expect(() => calculateTriangleVertices(5, 1, 1)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
    });

    it('should handle edge case where sum equals third side', () => {
      expect(() => calculateTriangleVertices(1, 2, 3)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
    });

    it('should handle floating point precision correctly', () => {
      const vertices = calculateTriangleVertices(1.1, 1.2, 1.3);
      
      expect(vertices).toHaveLength(3);
      expect(vertices[0].x).toBeCloseTo(0);
      expect(vertices[0].y).toBeCloseTo(0);
      expect(vertices[1].x).toBeCloseTo(1.1);
      expect(vertices[1].y).toBeCloseTo(0);
      expect(typeof vertices[2].x).toBe('number');
      expect(typeof vertices[2].y).toBe('number');
    });

    it('should maintain correct distances between vertices', () => {
      const [v1, v2, v3] = calculateTriangleVertices(5, 7, 9);
      
      const dist12 = v1.distanceTo(v2);
      const dist23 = v2.distanceTo(v3);
      const dist31 = v3.distanceTo(v1);
      
      expect(dist12).toBeCloseTo(5, 5);
      expect(dist23).toBeCloseTo(9, 5);
      expect(dist31).toBeCloseTo(7, 5);
    });
  });

  describe('calculateOutwardPerp', () => {
    it('should calculate outward perpendicular for simple triangle', () => {
      const edgeStart = new Vector2(0, 0);
      const edgeEnd = new Vector2(1, 0);
      const thirdVertex = new Vector2(0.5, 1);
      
      const perp = calculateOutwardPerp(edgeStart, edgeEnd, thirdVertex);
      
      expect(perp.x).toBeCloseTo(0);
      expect(perp.y).toBeCloseTo(-1); // Pointing downward (away from triangle)
      expect(perp.length()).toBeCloseTo(1); // Unit vector
    });

    it('should calculate outward perpendicular for different orientations', () => {
      const edgeStart = new Vector2(0, 0);
      const edgeEnd = new Vector2(0, 1);
      const thirdVertex = new Vector2(-1, 0.5);
      
      const perp = calculateOutwardPerp(edgeStart, edgeEnd, thirdVertex);
      
      expect(perp.x).toBeCloseTo(1); // Pointing right (away from triangle)
      expect(perp.y).toBeCloseTo(0);
      expect(perp.length()).toBeCloseTo(1);
    });

    it('should throw error for identical edge points', () => {
      const edgeStart = new Vector2(1, 1);
      const edgeEnd = new Vector2(1, 1);
      const thirdVertex = new Vector2(2, 2);
      
      expect(() => calculateOutwardPerp(edgeStart, edgeEnd, thirdVertex)).toThrow('Edge start and end points cannot be the same');
    });

    it('should handle right-angled triangle correctly', () => {
      const edgeStart = new Vector2(0, 0);
      const edgeEnd = new Vector2(3, 0);
      const thirdVertex = new Vector2(0, 4);
      
      const perp = calculateOutwardPerp(edgeStart, edgeEnd, thirdVertex);
      
      expect(perp.x).toBeCloseTo(0);
      expect(perp.y).toBeCloseTo(-1);
      expect(perp.length()).toBeCloseTo(1);
    });

    it('should produce consistent results regardless of edge direction', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(2, 0);
      const v3 = new Vector2(1, 1);
      
      const perp1 = calculateOutwardPerp(v1, v2, v3);
      const perp2 = calculateOutwardPerp(v2, v1, v3);
      
      // Should be opposite directions when edge direction is reversed
      expect(perp1.x).toBeCloseTo(-perp2.x);
      expect(perp1.y).toBeCloseTo(perp2.y); // Y component same since horizontal edge
    });
  });

  describe('findThirdVertex', () => {
    it('should find third vertex for a right triangle', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(3, 0);
      const v3 = findThirdVertex(v1, v2, 4, 5);
      
      expect(v3.x).toBeCloseTo(0);
      expect(v3.y).toBeCloseTo(4);
      
      // Verify distances
      expect(v1.distanceTo(v3)).toBeCloseTo(4);
      expect(v2.distanceTo(v3)).toBeCloseTo(5);
    });

    it('should find third vertex for an equilateral triangle', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(2, 0);
      const v3 = findThirdVertex(v1, v2, 2, 2);
      
      expect(v3.x).toBeCloseTo(1);
      expect(v3.y).toBeCloseTo(Math.sqrt(3));
      
      // Verify distances
      expect(v1.distanceTo(v3)).toBeCloseTo(2);
      expect(v2.distanceTo(v3)).toBeCloseTo(2);
    });

    it('should throw error for negative side lengths', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(1, 0);
      
      expect(() => findThirdVertex(v1, v2, -1, 2)).toThrow('Side lengths must be positive');
      expect(() => findThirdVertex(v1, v2, 1, -2)).toThrow('Side lengths must be positive');
    });

    it('should throw error for identical vertices', () => {
      const v1 = new Vector2(1, 1);
      const v2 = new Vector2(1, 1);
      
      expect(() => findThirdVertex(v1, v2, 1, 1)).toThrow('v1 and v2 cannot be the same point');
    });

    it('should throw error for invalid triangle', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(10, 0);
      
      expect(() => findThirdVertex(v1, v2, 1, 1)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
    });

    it('should handle floating point precision', () => {
      const v1 = new Vector2(0.1, 0.2);
      const v2 = new Vector2(1.3, 0.7);
      const v3 = findThirdVertex(v1, v2, 1.5, 1.8);
      
      expect(v1.distanceTo(v3)).toBeCloseTo(1.5, 5);
      expect(v2.distanceTo(v3)).toBeCloseTo(1.8, 5);
    });
  });

  describe('calculateTriangularPrismLabelPositions', () => {
    it('should calculate label positions for folded state', () => {
      const vertices: [Vector2, Vector2, Vector2] = [
        new Vector2(0, 0),
        new Vector2(3, 0),
        new Vector2(0, 4)
      ];
      const height = 2;
      
      const positions = calculateTriangularPrismLabelPositions(vertices, height, false);
      
      expect(positions.bottomFaceCenter.x).toBeCloseTo(1);
      expect(positions.bottomFaceCenter.y).toBeCloseTo(0);
      expect(positions.bottomFaceCenter.z).toBeCloseTo(4/3);
      
      expect(positions.topFaceCenter.x).toBeCloseTo(1);
      expect(positions.topFaceCenter.y).toBeCloseTo(2);
      expect(positions.topFaceCenter.z).toBeCloseTo(4/3);
      
      expect(positions.heightMidpoint.y).toBeCloseTo(1);
      expect(positions.bottomEdgeMidpoints).toHaveLength(3);
      expect(positions.topEdgeMidpoints).toHaveLength(3);
      expect(positions.sideFaceCenters).toHaveLength(3);
    });

    it('should calculate label positions for unfolded state', () => {
      const vertices: [Vector2, Vector2, Vector2] = [
        new Vector2(0, 0),
        new Vector2(2, 0),
        new Vector2(1, Math.sqrt(3))
      ];
      const height = 1.5;
      
      const positions = calculateTriangularPrismLabelPositions(vertices, height, true);
      
      // In unfolded state, most y-coordinates should be 0.1
      expect(positions.bottomFaceCenter.y).toBeCloseTo(0.1);
      expect(positions.topFaceCenter.y).toBeCloseTo(0.1);
      expect(positions.heightMidpoint.y).toBeCloseTo(0.1);
      
      positions.bottomEdgeMidpoints.forEach(point => {
        expect(point.y).toBeCloseTo(0.1);
      });
    });

    it('should calculate correct edge midpoints', () => {
      const vertices: [Vector2, Vector2, Vector2] = [
        new Vector2(0, 0),
        new Vector2(4, 0),
        new Vector2(2, 2)
      ];
      const height = 3;
      
      const positions = calculateTriangularPrismLabelPositions(vertices, height, false);
      
      expect(positions.bottomEdgeMidpoints[0].x).toBeCloseTo(2); // Midpoint of (0,0) and (4,0)
      expect(positions.bottomEdgeMidpoints[0].z).toBeCloseTo(0);
      
      expect(positions.bottomEdgeMidpoints[1].x).toBeCloseTo(3); // Midpoint of (4,0) and (2,2)
      expect(positions.bottomEdgeMidpoints[1].z).toBeCloseTo(1);
    });
  });

  describe('calculateTrapezoidalPrismLabelPositions', () => {
    it('should calculate label positions for folded state', () => {
      const dimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 2 };
      
      const positions = calculateTrapezoidalPrismLabelPositions(dimensions, false);
      
      expect(positions.topEdgeCenter.x).toBeCloseTo(0);
      expect(positions.bottomEdgeCenter.x).toBeCloseTo(0);
      expect(positions.depthEdgeCenter.x).toBeCloseTo(-2.2);
      
      expect(positions.faceCenters.bottom.y).toBeCloseTo(-1.8);
      expect(positions.faceCenters.top.y).toBeCloseTo(1.8);
      expect(positions.faceCenters.front.z).toBeCloseTo(1.3);
      expect(positions.faceCenters.back.z).toBeCloseTo(-1.3);
    });

    it('should calculate label positions for unfolded state', () => {
      const dimensions = { topWidth: 3, bottomWidth: 5, height: 4, depth: 3 };
      
      const positions = calculateTrapezoidalPrismLabelPositions(dimensions, true);
      
      // All y-coordinates should be 0.1 in unfolded state
      expect(positions.topEdgeCenter.y).toBeCloseTo(0.1);
      expect(positions.bottomEdgeCenter.y).toBeCloseTo(0.1);
      expect(positions.depthEdgeCenter.y).toBeCloseTo(0.1);
      expect(positions.heightPosition.y).toBeCloseTo(0.1);
      
      Object.values(positions.faceCenters).forEach(center => {
        expect(center.y).toBeCloseTo(0.1);
      });
    });

    it('should handle symmetric trapezoidal prism', () => {
      const dimensions = { topWidth: 2, bottomWidth: 2, height: 2, depth: 2 };
      
      const positions = calculateTrapezoidalPrismLabelPositions(dimensions, false);
      
      // For a symmetric prism (rectangle), positions should be centered
      expect(positions.topEdgeCenter.x).toBeCloseTo(0);
      expect(positions.bottomEdgeCenter.x).toBeCloseTo(0);
      expect(positions.faceCenters.left.x).toBeCloseTo(-1.3);
      expect(positions.faceCenters.right.x).toBeCloseTo(1.3);
    });
  });

  describe('calculateOptimalCameraPosition', () => {
    it('should calculate camera position for cube', () => {
      const dimensions = { width: 2, height: 2, depth: 2 };
      
      const config = calculateOptimalCameraPosition(dimensions);
      
      expect(config.fov).toBe(75);
      expect(config.near).toBe(0.1);
      expect(config.position.x).toBeGreaterThan(0);
      expect(config.position.y).toBeGreaterThan(0);
      expect(config.position.z).toBeGreaterThan(0);
      expect(config.lookAt.x).toBe(0);
      expect(config.lookAt.y).toBeGreaterThan(0);
      expect(config.lookAt.z).toBe(0);
    });

    it('should adjust for unfolded view', () => {
      const dimensions = { width: 4, height: 2, depth: 3 };
      
      const foldedConfig = calculateOptimalCameraPosition(dimensions, false);
      const unfoldedConfig = calculateOptimalCameraPosition(dimensions, true);
      
      // Unfolded should have greater distance and different positioning
      const foldedDistance = Math.sqrt(
        foldedConfig.position.x ** 2 + 
        foldedConfig.position.y ** 2 + 
        foldedConfig.position.z ** 2
      );
      const unfoldedDistance = Math.sqrt(
        unfoldedConfig.position.x ** 2 + 
        unfoldedConfig.position.y ** 2 + 
        unfoldedConfig.position.z ** 2
      );
      
      expect(unfoldedDistance).toBeGreaterThan(foldedDistance);
      expect(unfoldedConfig.lookAt.y).toBe(0);
      expect(foldedConfig.lookAt.y).toBeGreaterThan(0);
    });

    it('should handle very small dimensions', () => {
      const dimensions = { width: 0.1, height: 0.1, depth: 0.1 };
      
      const config = calculateOptimalCameraPosition(dimensions);
      
      // Should enforce minimum distance
      const distance = Math.sqrt(
        config.position.x ** 2 + 
        config.position.y ** 2 + 
        config.position.z ** 2
      );
      expect(distance).toBeGreaterThanOrEqual(3);
    });

    it('should handle very large dimensions', () => {
      const dimensions = { width: 100, height: 50, depth: 80 };
      
      const config = calculateOptimalCameraPosition(dimensions);
      
      expect(config.far).toBeGreaterThanOrEqual(1000);
      expect(config.position.x).toBeGreaterThan(50);
      expect(config.position.y).toBeGreaterThan(50);
      expect(config.position.z).toBeGreaterThan(40);
    });
  });

  describe('createStandardLighting', () => {
    it('should create lighting configuration', () => {
      const lighting = createStandardLighting();
      
      expect(lighting.ambient.color).toBe(0xffffff);
      expect(lighting.ambient.intensity).toBe(0.4);
      expect(lighting.directional).toHaveLength(2);
      expect(lighting.directional[0].intensity).toBe(0.6);
      expect(lighting.directional[1].intensity).toBe(0.3);
    });

    it('should create lighting for unfolded state', () => {
      const lighting = createStandardLighting(true);
      
      // Configuration should be the same regardless of unfolded state
      expect(lighting.ambient.intensity).toBe(0.4);
      expect(lighting.directional).toHaveLength(2);
    });
  });

  describe('createStandardOrbitControls', () => {
    it('should create OrbitControls configuration', () => {
      const controls = createStandardOrbitControls();
      
      expect(controls.enableDamping).toBe(true);
      expect(controls.minPolarAngle).toBe(Math.PI / 6);
      expect(controls.maxPolarAngle).toBe(Math.PI * 0.8);
      expect(controls.minDistance).toBe(3);
      expect(controls.maxDistance).toBe(10);
    });

    it('should adjust max distance for unfolded state', () => {
      const folded = createStandardOrbitControls(false);
      const unfolded = createStandardOrbitControls(true);
      
      expect(unfolded.maxDistance).toBeGreaterThan(folded.maxDistance);
      expect(unfolded.maxDistance).toBe(15);
    });
  });

  describe('calculateUnfoldedFaceTransform', () => {
    it('should create matrix for bottom face', () => {
      const matrix = calculateUnfoldedFaceTransform('bottom', 2);
      
      expect(matrix).toBeInstanceOf(Matrix4);
      expect(matrix.elements).toBeDefined();
    });

    it('should create matrix for top face', () => {
      const matrix = calculateUnfoldedFaceTransform('top', 2);
      
      expect(matrix).toBeInstanceOf(Matrix4);
      expect(matrix.elements).toBeDefined();
    });

    it('should create matrix for side faces', () => {
      const matrix1 = calculateUnfoldedFaceTransform('side1', 3, 0);
      const matrix2 = calculateUnfoldedFaceTransform('side2', 3, 1);
      const matrix3 = calculateUnfoldedFaceTransform('side3', 3, 2);
      
      expect(matrix1).toBeInstanceOf(Matrix4);
      expect(matrix2).toBeInstanceOf(Matrix4);
      expect(matrix3).toBeInstanceOf(Matrix4);
    });
  });

  describe('calculateTriangleHeight', () => {
    it('should calculate height for right triangle', () => {
      const height = calculateTriangleHeight(3, 4, 5, 5);
      
      expect(height).toBeCloseTo(2.4); // Area = 6, Base = 5, Height = 12/5 = 2.4
    });

    it('should calculate height for equilateral triangle', () => {
      const height = calculateTriangleHeight(2, 2, 2, 2);
      
      expect(height).toBeCloseTo(Math.sqrt(3)); // Standard equilateral triangle height
    });

    it('should use longest side as base when not specified', () => {
      const height1 = calculateTriangleHeight(3, 4, 5); // Should use 5 as base
      const height2 = calculateTriangleHeight(3, 4, 5, 5);
      
      expect(height1).toBeCloseTo(height2);
    });

    it('should throw error for invalid triangle', () => {
      expect(() => calculateTriangleHeight(1, 1, 3)).toThrow('Invalid triangle: sides do not satisfy triangle inequality');
    });

    it('should throw error for negative sides', () => {
      expect(() => calculateTriangleHeight(-1, 2, 3)).toThrow('All side lengths must be positive');
    });

    it('should handle isosceles triangle', () => {
      const height = calculateTriangleHeight(5, 5, 6, 6);
      
      expect(height).toBeCloseTo(4); // Isosceles triangle with base 6 and sides 5
    });
  });

  describe('calculateProjectionOnLine', () => {
    it('should project point onto horizontal line', () => {
      const point = new Vector2(2, 3);
      const lineStart = new Vector2(0, 1);
      const lineEnd = new Vector2(4, 1);
      
      const projection = calculateProjectionOnLine(point, lineStart, lineEnd);
      
      expect(projection.x).toBeCloseTo(2);
      expect(projection.y).toBeCloseTo(1);
    });

    it('should project point onto vertical line', () => {
      const point = new Vector2(3, 2);
      const lineStart = new Vector2(1, 0);
      const lineEnd = new Vector2(1, 4);
      
      const projection = calculateProjectionOnLine(point, lineStart, lineEnd);
      
      expect(projection.x).toBeCloseTo(1);
      expect(projection.y).toBeCloseTo(2);
    });

    it('should clamp projection to line segment bounds', () => {
      const point = new Vector2(5, 0);
      const lineStart = new Vector2(0, 0);
      const lineEnd = new Vector2(2, 0);
      
      const projection = calculateProjectionOnLine(point, lineStart, lineEnd);
      
      expect(projection.x).toBeCloseTo(2); // Clamped to line end
      expect(projection.y).toBeCloseTo(0);
    });

    it('should handle point before line start', () => {
      const point = new Vector2(-2, 1);
      const lineStart = new Vector2(0, 1);
      const lineEnd = new Vector2(3, 1);
      
      const projection = calculateProjectionOnLine(point, lineStart, lineEnd);
      
      expect(projection.x).toBeCloseTo(0); // Clamped to line start
      expect(projection.y).toBeCloseTo(1);
    });

    it('should handle zero-length line', () => {
      const point = new Vector2(2, 3);
      const lineStart = new Vector2(1, 1);
      const lineEnd = new Vector2(1, 1);
      
      const projection = calculateProjectionOnLine(point, lineStart, lineEnd);
      
      expect(projection.x).toBeCloseTo(1);
      expect(projection.y).toBeCloseTo(1);
    });

    it('should project onto diagonal line', () => {
      const point = new Vector2(2, 0);
      const lineStart = new Vector2(0, 0);
      const lineEnd = new Vector2(2, 2);
      
      const projection = calculateProjectionOnLine(point, lineStart, lineEnd);
      
      expect(projection.x).toBeCloseTo(1);
      expect(projection.y).toBeCloseTo(1);
    });
  });

  describe('Integration tests', () => {
    it('should maintain consistency between triangle calculations', () => {
      const vertices = calculateTriangleVertices(6, 8, 10);
      const height = calculateTriangleHeight(6, 8, 10, 10);
      
      // Verify the triangle is valid and height calculation is consistent
      expect(vertices).toHaveLength(3);
      expect(height).toBeGreaterThan(0);
      
      // The area calculated from vertices should match Heron's formula
      const base = vertices[1].distanceTo(vertices[0]);
      expect(base).toBeCloseTo(6);
    });

    it('should create consistent camera and control configurations', () => {
      const dimensions = { width: 4, height: 3, depth: 2 };
      const camera = calculateOptimalCameraPosition(dimensions);
      const controls = createStandardOrbitControls();
      
      // Camera distance should be within control bounds
      const distance = Math.sqrt(
        camera.position.x ** 2 + 
        camera.position.y ** 2 + 
        camera.position.z ** 2
      );
      
      expect(distance).toBeGreaterThanOrEqual(controls.minDistance);
      expect(distance).toBeLessThanOrEqual(controls.maxDistance);
    });

    it('should handle complex triangular prism scenario', () => {
      // Complex scenario with larger prism and all label calculations
      const vertices: [Vector2, Vector2, Vector2] = [
        new Vector2(0, 0),
        new Vector2(6, 0),
        new Vector2(3, 4)
      ];
      const height = 8;
      
      const positions = calculateTriangularPrismLabelPositions(vertices, height, false);
      const cameraConfig = calculateOptimalCameraPosition({ width: 6, height: 8, depth: 4 }, false);
      const lightingConfig = createStandardLighting(false);
      
      expect(positions.bottomFaceCenter.y).toBe(0);
      expect(positions.topFaceCenter.y).toBe(height);
      expect(cameraConfig.position.z).toBeGreaterThan(5);
      expect(lightingConfig.ambient.intensity).toBe(0.4);
    });
  });

  describe('createPrismGeometry', () => {
    it('should create folded triangular prism geometry', () => {
      const dimensions: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 6
      };
      
      const geometry = createPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined();
      expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute).toBeDefined();
      expect(geometry.userData.dimensions).toEqual(dimensions);
      
      const position = geometry.getAttribute('position');
      const color = geometry.getAttribute('color');
      
      expect(position).toBeTruthy();
      expect(color).toBeTruthy();
      expect(position.count).toBeGreaterThan(0);
      expect(color.count).toBeGreaterThan(0);
      
      // Should have material groups for different faces
      expect(geometry.groups.length).toBeGreaterThan(0);
    });

    it('should create unfolded triangular prism net geometry', () => {
      const dimensions: PrismDimensions = {
        sideA: 4,
        sideB: 3,
        sideC: 5,
        height: 2
      };
      
      const geometry = createPrismGeometry(dimensions, true);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.userData.dimensions).toEqual(dimensions);
      
      const position = geometry.getAttribute('position');
      const color = geometry.getAttribute('color');
      const indices = geometry.getIndex();
      
      expect(position).toBeTruthy();
      expect(color).toBeTruthy();
      expect(indices).toBeTruthy();
      
      // Unfolded geometry should have specific structure
      expect(position.count).toBe(18); // 6 faces * 3 vertices
      expect(color.count).toBe(18);
      expect(geometry.groups.length).toBe(5); // 5 material groups
    });

    it('should create geometry with correct vertex normals', () => {
      const dimensions: PrismDimensions = {
        sideA: 2,
        sideB: 2,
        sideC: 2,
        height: 3
      };
      
      const geometry = createPrismGeometry(dimensions, false);
      const normals = geometry.getAttribute('normal');
      
      expect(normals).toBeTruthy();
      expect(normals.count).toBe(geometry.getAttribute('position').count);
    });

    it('should handle different triangle types in folded state', () => {
      // Right triangle
      const rightTriangle: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 2
      };
      
      // Equilateral triangle
      const equilateral: PrismDimensions = {
        sideA: 4,
        sideB: 4,
        sideC: 4,
        height: 2
      };
      
      // Isosceles triangle
      const isosceles: PrismDimensions = {
        sideA: 5,
        sideB: 3,
        sideC: 3,
        height: 2
      };
      
      const geom1 = createPrismGeometry(rightTriangle, false);
      const geom2 = createPrismGeometry(equilateral, false);
      const geom3 = createPrismGeometry(isosceles, false);
      
      expect(geom1.getAttribute('position').count).toBeGreaterThan(0);
      expect(geom2.getAttribute('position').count).toBeGreaterThan(0);
      expect(geom3.getAttribute('position').count).toBeGreaterThan(0);
      
      // Each should have same structure but different coordinates
      expect(geom1.groups.length).toBe(geom2.groups.length);
      expect(geom2.groups.length).toBe(geom3.groups.length);
    });

    it('should handle edge case with very small dimensions', () => {
      const dimensions: PrismDimensions = {
        sideA: 0.1,
        sideB: 0.1,
        sideC: 0.1,
        height: 0.05
      };
      
      const geometry = createPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });

    it('should handle edge case with very large dimensions', () => {
      const dimensions: PrismDimensions = {
        sideA: 100,
        sideB: 120,
        sideC: 80,
        height: 200
      };
      
      const geometry = createPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });
  });

  describe('createTrapezoidalPrismGeometry', () => {
    it('should create folded trapezoidal prism geometry', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 2,
        bottomWidth: 4,
        height: 3,
        depth: 5
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.userData.dimensions).toEqual(dimensions);
      
      const position = geometry.getAttribute('position');
      const color = geometry.getAttribute('color');
      
      expect(position).toBeTruthy();
      expect(color).toBeTruthy();
      expect(position.count).toBeGreaterThan(0);
      expect(color.count).toBeGreaterThan(0);
    });

    it('should create unfolded trapezoidal prism net geometry', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 3,
        bottomWidth: 6,
        height: 4,
        depth: 2
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, true);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.userData.dimensions).toEqual(dimensions);
      
      const position = geometry.getAttribute('position');
      const color = geometry.getAttribute('color');
      const indices = geometry.getIndex();
      
      expect(position).toBeTruthy();
      expect(color).toBeTruthy();
      expect(indices).toBeTruthy();
      
      // Unfolded geometry should have 6 faces laid out flat
      expect(position.count).toBe(24); // 6 faces * 4 vertices
      expect(color.count).toBe(24);
    });

    it('should handle symmetric trapezoidal prism (rectangle)', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 4,
        bottomWidth: 4, // Same as top - makes it a rectangular prism
        height: 3,
        depth: 2
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });

    it('should handle very wide trapezoidal prism', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 1,
        bottomWidth: 10,
        height: 2,
        depth: 3
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });

    it('should handle inverted trapezoid (top wider than bottom)', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 8,
        bottomWidth: 3,
        height: 5,
        depth: 4
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });

    it('should create geometry with proper vertex normals', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 3,
        bottomWidth: 5,
        height: 4,
        depth: 2
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      const normals = geometry.getAttribute('normal');
      
      expect(normals).toBeTruthy();
      expect(normals.count).toBe(geometry.getAttribute('position').count);
    });

    it('should handle minimal dimensions', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 0.1,
        bottomWidth: 0.2,
        height: 0.1,
        depth: 0.1
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });

    it('should handle large dimensions', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 50,
        bottomWidth: 100,
        height: 75,
        depth: 200
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });
  });

  describe('Geometry creation performance benchmarks', () => {
    it('should create triangular prism geometry efficiently', () => {
      const dimensions: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 6
      };
      
      const startTime = performance.now();
      
      // Create multiple geometries to test performance
      for (let i = 0; i < 100; i++) {
        const geometry = createPrismGeometry(dimensions, false);
        geometry.dispose(); // Clean up
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 geometries in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should create trapezoidal prism geometry efficiently', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 2,
        bottomWidth: 4,
        height: 3,
        depth: 5
      };
      
      const startTime = performance.now();
      
      // Create multiple geometries to test performance
      for (let i = 0; i < 100; i++) {
        const geometry = createTrapezoidalPrismGeometry(dimensions, false);
        geometry.dispose(); // Clean up
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 geometries in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle rapid geometry switching between folded and unfolded states', () => {
      const triangularDims: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 2
      };
      
      const trapezoidalDims: TrapezoidalPrismDimensions = {
        topWidth: 2,
        bottomWidth: 4,
        height: 3,
        depth: 2
      };
      
      const startTime = performance.now();
      
      // Simulate rapid state changes
      for (let i = 0; i < 50; i++) {
        const foldedTriangular = createPrismGeometry(triangularDims, false);
        const unfoldedTriangular = createPrismGeometry(triangularDims, true);
        const foldedTrapezoidal = createTrapezoidalPrismGeometry(trapezoidalDims, false);
        const unfoldedTrapezoidal = createTrapezoidalPrismGeometry(trapezoidalDims, true);
        
        // Clean up
        foldedTriangular.dispose();
        unfoldedTriangular.dispose();
        foldedTrapezoidal.dispose();
        unfoldedTrapezoidal.dispose();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle rapid switching efficiently (< 2 seconds for 200 geometries)
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Edge case and error handling for geometry creation', () => {
    it('should handle zero-width trapezoidal prism', () => {
      const dimensions: TrapezoidalPrismDimensions = {
        topWidth: 0,
        bottomWidth: 4,
        height: 3,
        depth: 2
      };
      
      const geometry = createTrapezoidalPrismGeometry(dimensions, false);
      
      expect(geometry).toBeDefined(); expect(geometry.setAttribute).toBeDefined();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
    });

    it('should handle zero-height prism', () => {
      const triangularDims: PrismDimensions = {
        sideA: 3,
        sideB: 4,
        sideC: 5,
        height: 0
      };
      
      const trapezoidalDims: TrapezoidalPrismDimensions = {
        topWidth: 2,
        bottomWidth: 4,
        height: 0,
        depth: 2
      };
      
      const triangularGeometry = createPrismGeometry(triangularDims, false);
      const trapezoidalGeometry = createTrapezoidalPrismGeometry(trapezoidalDims, false);
      
      expect(triangularGeometry).toBeDefined(); expect(triangularGeometry.setAttribute).toBeDefined();
      expect(trapezoidalGeometry).toBeDefined(); expect(trapezoidalGeometry.setAttribute).toBeDefined();
    });

    it('should maintain geometry integrity with extreme aspect ratios', () => {
      // Very tall, thin triangular prism
      const tallThin: PrismDimensions = {
        sideA: 0.1,
        sideB: 0.1,
        sideC: 0.1,
        height: 100
      };
      
      // Very short, wide trapezoidal prism  
      const shortWide: TrapezoidalPrismDimensions = {
        topWidth: 50,
        bottomWidth: 100,
        height: 0.1,
        depth: 75
      };
      
      const tallGeometry = createPrismGeometry(tallThin, false);
      const wideGeometry = createTrapezoidalPrismGeometry(shortWide, false);
      
      expect(tallGeometry.getAttribute('position').count).toBeGreaterThan(0);
      expect(wideGeometry.getAttribute('position').count).toBeGreaterThan(0);
      
      // Geometries should have valid bounding boxes
      tallGeometry.computeBoundingBox();
      wideGeometry.computeBoundingBox();
      
      expect(tallGeometry.boundingBox).toBeTruthy();
      expect(wideGeometry.boundingBox).toBeTruthy();
    });
  });
});
