class CSS2DObject {
  constructor(element) {
    this.element = element;
    this.position = {
      copy: jest.fn(function(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
      }),
      add: jest.fn(function(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
      }),
      set: jest.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }),
      x: 0,
      y: 0,
      z: 0,
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
    this.layers = { 
      set: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      test: jest.fn()
    };
    this.userData = {};
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.hasEventListener = jest.fn();
    this.dispatchEvent = jest.fn();
    this.parent = null;
    this.children = [];
    this.removeFromParent = jest.fn();
    this.add = jest.fn();
    this.remove = jest.fn();
    this.onBeforeRender = jest.fn();
    this.onAfterRender = jest.fn();
    this.traverse = jest.fn();
    this.clone = jest.fn();
    this.copy = jest.fn();
    
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

class CSS2DRenderer {
  constructor() {
    this.domElement = typeof global.document !== 'undefined' 
      ? global.document.createElement('div')
      : {
          style: {},
          appendChild: jest.fn(),
          removeChild: jest.fn(),
          parentNode: { removeChild: jest.fn() },
        };
  }
  setSize(_width, _height) {}
  render(_scene, _camera) {}
}

module.exports = { CSS2DObject, CSS2DRenderer };
