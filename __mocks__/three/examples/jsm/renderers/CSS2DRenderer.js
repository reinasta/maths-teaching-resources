// __mocks__/three/examples/jsm/renderers/CSS2DRenderer.js

// Create a proper DOM element that JSDOM will recognize
const createMockDOMElement = () => {
  const element = document.createElement('div');
  element.style = {};
  return element;
};

class CSS2DRenderer {
  constructor() {
    this.domElement = createMockDOMElement();
    this.getSize = jest.fn().mockReturnValue({ width: 800, height: 600 });
    this.setSize = jest.fn();
    this.render = jest.fn();
  }
}

class CSS2DObject {
  constructor(element) {
    this.element = element || createMockDOMElement();
    this.position = {
      x: 0,
      y: 0,
      z: 0,
      copy: jest.fn(function(source) {
        this.x = source.x;
        this.y = source.y;
        this.z = source.z;
        return this;
      }),
      set: jest.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }),
    };
    this.rotation = {
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn()
    };
    this.scale = {
      x: 1,
      y: 1,
      z: 1,
      set: jest.fn()
    };
    this.matrix = {
      copy: jest.fn(),
      multiply: jest.fn()
    };
    this.matrixWorld = {
      copy: jest.fn(),
      multiply: jest.fn()
    };
    this.userData = {};
    this.layers = {
      set: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      test: jest.fn(),
    };
    this.children = [];
    this.parent = null;
    this.add = jest.fn();
    this.remove = jest.fn();
    this.removeFromParent = jest.fn();
    this.onBeforeRender = jest.fn();
    this.onAfterRender = jest.fn();
    this.traverse = jest.fn();
    this.clone = jest.fn().mockReturnThis();
    this.copy = jest.fn().mockReturnThis();
    this.dispatchEvent = jest.fn();
    this.addEventListener = jest.fn();
    this.hasEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    
    // Critical properties for Object3D compatibility
    this.isObject3D = true;
    this.isCSS2DObject = true;
    this.type = 'CSS2DObject';
    this.uuid = Math.random().toString(36).substr(2, 9);
    this.name = '';
    this.visible = true;
    this.castShadow = false;
    this.receiveShadow = false;
    this.frustumCulled = true;
    this.renderOrder = 0;
  }
}

module.exports = { CSS2DRenderer, CSS2DObject };
