// Extend existing Three.js mock to include Group
const THREE = jest.createMockFromModule('three');

// Mock Group class that matches Three.js Group interface
class Group {
  constructor() {
    this.children = [];
    this.position = { x: 0, y: 0, z: 0, set: jest.fn() };
    this.rotation = { x: 0, y: 0, z: 0, set: jest.fn() };
    this.scale = { x: 1, y: 1, z: 1, set: jest.fn() };
    this.userData = {};
    this.visible = true;
    this.layers = {
      set: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      test: jest.fn(),
    };
  }

  add(object) {
    if (object && !this.children.includes(object)) {
      this.children.push(object);
    }
    return this;
  }

  remove(object) {
    const index = this.children.indexOf(object);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    return this;
  }

  clear() {
    this.children.length = 0;
    return this;
  }

  traverse(callback) {
    callback(this);
    this.children.forEach(child => {
      if (child.traverse) {
        child.traverse(callback);
      }
    });
  }

  clone() {
    return new Group();
  }

  copy(_source) {
    return this;
  }
}

module.exports = {
  ...THREE,
  Group,
  // Keep existing mocks
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    domElement: document.createElement('canvas'),
    setSize: jest.fn(),
    render: jest.fn(),
    setPixelRatio: jest.fn(),
    setClearColor: jest.fn(),
    shadowMap: { enabled: false, type: null },
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn(),
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
  })),
  // Add other existing mocks...
};