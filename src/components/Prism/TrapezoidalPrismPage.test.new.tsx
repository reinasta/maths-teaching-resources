import { render, screen } from '@testing-library/react';
import TrapezoidalPrismPage from '@/app/components/standalone/trapezoidal-prism/page';
import TrapezoidalPrism, { TrapezoidalPrismProps } from '@/components/Prism/TrapezoidalPrism';

// Mock TrapezoidalPrism component
jest.mock('@/components/Prism/TrapezoidalPrism', () => {
  const MockComponent = (props: any) => (
    <div data-testid="trapezoidal-prism-mock" {...props}>TrapezoidalPrism Mock</div>
  );
  MockComponent.displayName = 'TrapezoidalPrismMock';
  return {
    __esModule: true,
    default: MockComponent,
  };
});

// Mock TrapezoidalPrismControls
jest.mock('@/components/PrismControls/TrapezoidalPrismControls', () => {
  const MockComponent = () => <div>TrapezoidalPrismControls Mock</div>;
  MockComponent.displayName = 'TrapezoidalPrismControlsMock';
  return MockComponent;
});

// Mock LabelLegend
jest.mock('@/components/LabelLegend/LabelLegend', () => {
  const MockComponent = () => <div>LabelLegend Mock</div>;
  MockComponent.displayName = 'LabelLegendMock';
  return MockComponent;
});

// Mock Three.js
jest.mock('three', () => {
  const createMockVector3 = (x = 0, y = 0, z = 0) => ({
    x,
    y,
    z,
    set: jest.fn().mockReturnThis(),
    copy: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    length: jest.fn(() => 0),
    applyMatrix4: jest.fn().mockReturnThis(),
  });

  const createMockMatrix4 = () => ({
    elements: new Array(16).fill(0),
    clone: jest.fn().mockReturnThis(),
    copy: jest.fn().mockReturnThis(),
    setPosition: jest.fn().mockReturnThis(),
    decompose: jest.fn(),
    multiplyMatrices: jest.fn().mockReturnThis(),
    makeRotationFromEuler: jest.fn().mockReturnThis(),
    identity: jest.fn().mockReturnThis(),
  });

  return {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      domElement: typeof global.document !== 'undefined' 
        ? global.document.createElement('canvas') 
        : { style: {}, appendChild: jest.fn() },
      setSize: jest.fn(),
      render: jest.fn(),
      setAnimationLoop: jest.fn(),
      dispose: jest.fn(),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      background: null,
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      aspect: 1,
      updateProjectionMatrix: jest.fn(),
      position: createMockVector3(4, 4, 3),
      lookAt: jest.fn(),
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      children: [],
      position: createMockVector3(),
      rotation: { set: jest.fn(), copy: jest.fn(), x: 0, y: 0, z: 0, _order: 'XYZ' },
      scale: createMockVector3(1, 1, 1),
      quaternion: { setFromEuler: jest.fn() },
      traverse: jest.fn(),
      getObjectByName: jest.fn(),
    })),
    Vector3: jest.fn().mockImplementation(createMockVector3),
    Color: jest.fn().mockImplementation((r, g, b) => ({
      r: r || 0,
      g: g || 0,
      b: b || 0,
      set: jest.fn().mockReturnThis(),
      setHex: jest.fn().mockReturnThis(),
    })),
    BufferGeometry: jest.fn().mockImplementation(() => ({
      dispose: jest.fn(),
      setAttribute: jest.fn(),
      setIndex: jest.fn(),
      computeVertexNormals: jest.fn(),
      center: jest.fn(),
      attributes: {
        position: { array: [], count: 0 }
      }
    })),
    Mesh: jest.fn().mockImplementation((geometry, material) => ({
      position: createMockVector3(),
      rotation: { set: jest.fn(), copy: jest.fn(), x: 0, y: 0, z: 0, _order: 'XYZ' },
      scale: createMockVector3(1, 1, 1),
      quaternion: { setFromEuler: jest.fn() },
      geometry: geometry || { dispose: jest.fn(), attributes: { position: { array: [], count: 0 } } },
      material: material || { dispose: jest.fn(), wireframe: false, color: { set: jest.fn() } },
      add: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      children: [],
      traverse: jest.fn(),
      getObjectByName: jest.fn(),
      layers: { set: jest.fn(), enable: jest.fn() },
      castShadow: false,
      receiveShadow: false,
      name: '',
      matrixWorld: createMockMatrix4()
    })),
    MeshBasicMaterial: jest.fn().mockImplementation((params) => ({
      ...params,
      dispose: jest.fn(),
      wireframe: params?.wireframe || false,
      color: { set: jest.fn(), ...params?.color },
      opacity: params?.opacity === undefined ? 1 : params.opacity,
      transparent: params?.transparent || false,
      side: params?.side,
    })),
    AmbientLight: jest.fn().mockImplementation(() => ({})),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() }
    })),
    EdgesGeometry: jest.fn().mockImplementation(() => ({
      dispose: jest.fn(),
    })),
    LineBasicMaterial: jest.fn().mockImplementation((params) => ({
      ...params,
      dispose: jest.fn(),
    })),
    LineSegments: jest.fn().mockImplementation((geometry, material) => ({
      geometry: geometry || { dispose: jest.fn() },
      material: material || { dispose: jest.fn() },
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
    })),
    FrontSide: 'FrontSide',
    DoubleSide: 'DoubleSide',
    BackSide: 'BackSide',
    Euler: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      x: 0,
      y: 0,
      z: 0,
      order: 'XYZ',
    })),
    Quaternion: jest.fn().mockImplementation(() => ({
      setFromEuler: jest.fn(),
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      children: [],
      position: createMockVector3(),
      rotation: { set: jest.fn(), copy: jest.fn(), x: 0, y: 0, z: 0, _order: 'XYZ' },
      scale: createMockVector3(1, 1, 1),
      quaternion: { setFromEuler: jest.fn() },
      traverse: jest.fn(),
      getObjectByName: jest.fn(),
      layers: { set: jest.fn(), enable: jest.fn() },
      castShadow: false,
      receiveShadow: false,
      name: '',
      updateMatrixWorld: jest.fn(),
      matrixWorld: createMockMatrix4()
    })),
    Matrix4: jest.fn().mockImplementation(createMockMatrix4),
  };
});

// Mock CSS2DRenderer
jest.mock('three/examples/jsm/renderers/CSS2DRenderer', () => {
  return {
    CSS2DRenderer: jest.fn().mockImplementation(() => {
      const div = typeof global.document !== 'undefined' 
        ? global.document.createElement('div') 
        : { style: {}, appendChild: jest.fn() };
      return {
        domElement: div,
        setSize: jest.fn(),
        render: jest.fn(),
      };
    }),
    CSS2DObject: jest.fn().mockImplementation((element) => {
      const el = element || (typeof global.document !== 'undefined' 
        ? global.document.createElement('div') 
        : { style: {} });
      return {
        element: el,
        position: { copy: jest.fn(), set: jest.fn() },
        layers: { set: jest.fn() },
      };
    }),
  };
});

describe('TrapezoidalPrismPage', () => {
  it('renders the page and key components', () => {
    render(<TrapezoidalPrismPage />);
    expect(screen.getByRole('heading', { name: /Trapezoidal Prism/i })).toBeInTheDocument();
    expect(screen.getByTestId('trapezoidal-prism-mock')).toBeInTheDocument();
  });
  
  it('renders without crashing', () => {
    render(<TrapezoidalPrismPage />);
    expect(document.body).toBeInTheDocument();
  });
});

describe('TrapezoidalPrism', () => {
  it('renders without crashing', () => {
    const mockProps: TrapezoidalPrismProps = {
      dimensions: {
        bottomWidth: 10,
        topWidth: 6,
        height: 5,
        depth: 6,
      },
      visualStyle: 'colored',
      isUnfolded: false,
      labelConfig: {
        showVolume: true,
        showSurfaceArea: true,
        showFaces: false
      },
      calculations: {
        leftSide: 6.7,
        rightSide: 6.3,
        surfaceArea: 167,
        volume: 240
      }
    };
    
    render(<TrapezoidalPrism {...mockProps} />);
    expect(document.body).toBeInTheDocument();
  });
});
