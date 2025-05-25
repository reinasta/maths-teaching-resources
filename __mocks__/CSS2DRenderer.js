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
    this.layers = { set: jest.fn() };
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    this.dispatchEvent = jest.fn();
    this.parent = null;
    this.removeFromParent = jest.fn();
    this.add = jest.fn();
    this.remove = jest.fn();
    this.isCSS2DObject = true;
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
