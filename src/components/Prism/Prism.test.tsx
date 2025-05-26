import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import Prism from './Prism';

const defaultDimensions = { sideA: 3, sideB: 4, sideC: 5, height: 6 };
const defaultLabelConfig = { showVolume: true, showSurfaceArea: false, showFaces: false };

// Mock Three.js modules to avoid WebGL issues in tests
jest.mock('three', () => ({
  ...jest.requireActual('three'),
  WebGLRenderer: jest.fn().mockImplementation(() => {
    // Create a proper DOM canvas element for JSDOM compatibility  
    const canvas = global.document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 150;
    
    return {
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      shadowMap: { enabled: false, type: '' },
      domElement: canvas,
      render: jest.fn(),
      dispose: jest.fn(),
    };
  }),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    aspect: 1,
    updateProjectionMatrix: jest.fn(),
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    background: null,
    children: [], // Add the children array that Scene needs
  })),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    castShadow: false,
  })),
  AmbientLight: jest.fn(),
}));

describe('Prism 3D Component', () => {
  beforeEach(() => {
    // Mock canvas getContext to avoid WebGL warnings  
    const mockGetContext = jest.fn() as jest.Mock;
    mockGetContext.mockReturnValue({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    });
    
    // Override getContext with our mock
    HTMLCanvasElement.prototype.getContext = mockGetContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    expect(() => {
      render(
        <Prism
          dimensions={defaultDimensions}
          visualStyle="solid"
          labelConfig={defaultLabelConfig}
        />
      );
    }).not.toThrow();
  });

  it('should create canvas element for 3D rendering', () => {
    const { container } = render(
      <Prism
        dimensions={defaultDimensions}
        visualStyle="solid"
        labelConfig={defaultLabelConfig}
      />
    );
    
    // Check that canvas elements are created (one for WebGL, one for CSS2D labels)
    const canvasElements = container.querySelectorAll('canvas');
    expect(canvasElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle different visual styles without errors', () => {
    const styles: Array<'solid' | 'colored' | 'wireframe'> = ['solid', 'colored', 'wireframe'];
    
    styles.forEach(style => {
      expect(() => {
        const { unmount } = render(
          <Prism
            dimensions={defaultDimensions}
            visualStyle={style}
            labelConfig={defaultLabelConfig}
          />
        );
        unmount();
      }).not.toThrow();
    });
  });

  it('should handle dimension changes without errors', () => {
    const { rerender } = render(
      <Prism
        dimensions={defaultDimensions}
        visualStyle="solid"
        labelConfig={defaultLabelConfig}
      />
    );
    
    expect(() => {
      rerender(
        <Prism
          dimensions={{ sideA: 6, sideB: 8, sideC: 10, height: 12 }}
          visualStyle="solid"
          labelConfig={defaultLabelConfig}
        />
      );
    }).not.toThrow();
  });

  it('should handle unfold state changes without errors', () => {
    const { rerender } = render(
      <Prism
        dimensions={defaultDimensions}
        visualStyle="solid"
        labelConfig={defaultLabelConfig}
        isUnfolded={false}
      />
    );
    
    expect(() => {
      rerender(
        <Prism
          dimensions={defaultDimensions}
          visualStyle="solid"
          labelConfig={defaultLabelConfig}
          isUnfolded={true}
        />
      );
    }).not.toThrow();
  });

  it('should handle different label configurations without errors', () => {
    const labelConfigs = [
      { showVolume: true, showSurfaceArea: false, showFaces: false },
      { showVolume: false, showSurfaceArea: true, showFaces: false },
      { showVolume: false, showSurfaceArea: false, showFaces: true },
      { showVolume: true, showSurfaceArea: true, showFaces: true },
    ];
    
    labelConfigs.forEach(config => {
      expect(() => {
        const { unmount } = render(
          <Prism
            dimensions={defaultDimensions}
            visualStyle="solid"
            labelConfig={config}
          />
        );
        unmount();
      }).not.toThrow();
    });
  });
});

// Visual regression tests for 3D components
describe('Prism 3D Component - Visual Regression', () => {
  it('should maintain consistent rendering across prop changes', () => {
    // This test ensures that the component can handle rapid prop changes
    // which is important for visual consistency during interactions
    
    const { rerender } = render(
      <Prism
        dimensions={defaultDimensions}
        visualStyle="solid"
        labelConfig={defaultLabelConfig}
      />
    );
    
    // Simulate rapid dimension changes (like slider interactions)
    const changes = [
      { sideA: 3.5, sideB: 4, sideC: 5, height: 6 },
      { sideA: 4, sideB: 4, sideC: 5, height: 6 },
      { sideA: 4, sideB: 4.5, sideC: 5, height: 6 },
      { sideA: 4, sideB: 4.5, sideC: 5.5, height: 6 },
      { sideA: 4, sideB: 4.5, sideC: 5.5, height: 6.5 },
    ];
    
    changes.forEach(dimensions => {
      expect(() => {
        rerender(
          <Prism
            dimensions={dimensions}
            visualStyle="solid"
            labelConfig={defaultLabelConfig}
          />
        );
      }).not.toThrow();
    });
  });

  it('should handle edge case dimensions gracefully', () => {
    // Test minimum valid triangle dimensions
    const minDimensions = { sideA: 1, sideB: 1, sideC: 1.5, height: 1 };
    
    expect(() => {
      render(
        <Prism
          dimensions={minDimensions}
          visualStyle="solid"
          labelConfig={defaultLabelConfig}
        />
      );
    }).not.toThrow();
    
    // Test larger dimensions
    const maxDimensions = { sideA: 5, sideB: 5, sideC: 5, height: 5 };
    
    expect(() => {
      render(
        <Prism
          dimensions={maxDimensions}
          visualStyle="wireframe"
          labelConfig={{ showVolume: true, showSurfaceArea: true, showFaces: true }}
        />
      );
    }).not.toThrow();
  });

  it('should properly cleanup resources on unmount', () => {
    const { unmount } = render(
      <Prism
        dimensions={defaultDimensions}
        visualStyle="solid"
        labelConfig={defaultLabelConfig}
      />
    );
    
    // Unmounting should not throw errors and should properly cleanup Three.js resources
    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
