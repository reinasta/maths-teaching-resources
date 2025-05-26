// __mocks__/three.js
const THREE = {
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    setClearColor: jest.fn(),
    setPixelRatio: jest.fn(),
    domElement: document.createElement('canvas'),
    dispose: jest.fn(),
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    children: [],
    remove: jest.fn(),
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: {
      set: jest.fn(),
      x: 0,
      y: 0,
      z: 0,
    },
    lookAt: jest.fn(),
  })),
  Color: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    add: jest.fn(function(child) {
      // Simulate adding a child to the mesh's children array
      if (!this.children) this.children = [];
      this.children.push(child);
    }),
    remove: jest.fn(function(child) {
      if (!this.children) this.children = [];
      this.children = this.children.filter(c => c !== child);
    }),
  })),
  MeshBasicMaterial: jest.fn(),
  MeshPhongMaterial: jest.fn().mockImplementation(() => ({
    setValues: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
  })),
  BoxGeometry: jest.fn(),
  Matrix4: jest.fn(function Matrix4() {
    this.set = jest.fn(() => this);
    this.multiply = jest.fn(() => this);
    this.getInverse = jest.fn(() => this);
    this.makeRotationFromQuaternion = jest.fn(() => this);
    this.copy = jest.fn(() => this);
    this.clone = jest.fn(() => new THREE.Matrix4());
    this.invert = jest.fn(() => this);
    this.multiplyMatrices = jest.fn(() => this);
    this.decompose = jest.fn(() => this);
    this.compose = jest.fn(() => this);
    this.identity = jest.fn(() => this);
    this.lookAt = jest.fn(() => this);
    this.makeRotationY = jest.fn(() => this);
    this.makeRotationX = jest.fn(() => this);
    this.makeRotationZ = jest.fn(() => this);
    this.setPosition = jest.fn(() => this);
    this.makeTranslation = jest.fn(() => this);
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
    return this;
  }),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: jest.fn(function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }),
    copy: jest.fn(function(vector) {
      this.x = vector.x;
      this.y = vector.y;
      this.z = vector.z;
      return this;
    }),
    clone: jest.fn(function() {
      return new THREE.Vector3(this.x, this.y, this.z);
    }),
    sub: jest.fn(function(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      this.z -= vector.z;
      return this;
    }),
    add: jest.fn(function(vector) {
      this.x += vector.x;
      this.y += vector.y;
      this.z += vector.z;
      return this;
    }),
    addVectors: jest.fn(function(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      return this;
    }),
    multiplyScalar: jest.fn(function(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      return this;
    }),
    normalize: jest.fn(function() {
      const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      if (length > 0) {
        this.x /= length;
        this.y /= length;
        this.z /= length;
      }
      return this;
    }),
    cross: jest.fn(function(vector) {
      const ax = this.x, ay = this.y, az = this.z;
      const bx = vector.x, by = vector.y, bz = vector.z;
      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;
      return this;
    }),
    dot: jest.fn(function(vector) {
      return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }),
    length: jest.fn(function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }),
    distanceTo: jest.fn(function(vector) {
      const dx = this.x - vector.x;
      const dy = this.y - vector.y;
      const dz = this.z - vector.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }),
    applyMatrix4: jest.fn(function(_matrix) {
      return this;
    }),
    equals: jest.fn(function(vector) {
      return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }),
  })),
  Group: jest.fn().mockImplementation(() => ({
    type: 'Group',
    children: [],
    add: jest.fn(function(child) {
      if (!this.children) this.children = [];
      this.children.push(child);
      return this;
    }),
    remove: jest.fn(function(child) {
      if (!this.children) this.children = [];
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
      return this;
    }),
    clear: jest.fn(function() {
      this.children = [];
      return this;
    }),
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { set: jest.fn(), x: 1, y: 1, z: 1 },
    updateMatrix: jest.fn(),
    updateMatrixWorld: jest.fn(),
    visible: true,
    userData: {},
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
  })),
  Object3D: jest.fn().mockImplementation(() => ({
    type: 'Object3D',
    children: [],
    position: new THREE.Vector3(0, 0, 0),
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { set: jest.fn(), x: 1, y: 1, z: 1 },
    add: jest.fn(function(child) {
      if (!this.children) this.children = [];
      this.children.push(child);
      return this;
    }),
    remove: jest.fn(function(child) {
      if (!this.children) this.children = [];
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
      return this;
    }),
    updateMatrix: jest.fn(),
    updateMatrixWorld: jest.fn(),
    visible: true,
    userData: {},
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
  })),
  Material: jest.fn().mockImplementation(() => ({
    type: 'Material',
    dispose: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    setValues: jest.fn(),
    toJSON: jest.fn(),
  })),
  DoubleSide: 2,
  Ray: jest.fn().mockImplementation(() => ({
    at: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    intersectBox: jest.fn(),
    intersectSphere: jest.fn(),
    intersectPlane: jest.fn(),
    direction: { x: 0, y: 0, z: 0 },
    origin: { x: 0, y: 0, z: 0 },
  })),
  Plane: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    normalize: jest.fn(),
    distanceToPoint: jest.fn(),
    projectPoint: jest.fn(),
    intersectLine: jest.fn(),
    coplanarPoint: jest.fn(),
    translate: jest.fn(),
    equals: jest.fn(),
    normal: { x: 0, y: 1, z: 0 },
    constant: 0,
  })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: {
      set: jest.fn(),
      x: 0,
      y: 0,
      z: 0,
    },
  })),
  Vector2: jest.fn().mockImplementation((x = 0, y = 0) => ({
    x,
    y,
    set: jest.fn(function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }),
    copy: jest.fn(function(vector) {
      this.x = vector.x;
      this.y = vector.y;
      return this;
    }),
    clone: jest.fn(function() {
      return new THREE.Vector2(this.x, this.y);
    }),
    sub: jest.fn(function(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
    }),
    add: jest.fn(function(vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
    }),
    subVectors: jest.fn(function(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      return this;
    }),
    addVectors: jest.fn(function(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      return this;
    }),
    addScaledVector: jest.fn(function(vector, scalar) {
      this.x += vector.x * scalar;
      this.y += vector.y * scalar;
      return this;
    }),
    multiplyScalar: jest.fn(function(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }),
    normalize: jest.fn(function() {
      const length = Math.sqrt(this.x * this.x + this.y * this.y);
      if (length > 0) {
        this.x /= length;
        this.y /= length;
      }
      return this;
    }),
    dot: jest.fn(function(vector) {
      return this.x * vector.x + this.y * vector.y;
    }),
    length: jest.fn(function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }),
    distanceTo: jest.fn(function(vector) {
      const dx = this.x - vector.x;
      const dy = this.y - vector.y;
      return Math.sqrt(dx * dx + dy * dy);
    }),
    equals: jest.fn(function(vector) {
      return this.x === vector.x && this.y === vector.y;
    }),
  })),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    setAttribute: jest.fn(function(name, attribute) {
      this.attributes = this.attributes || {};
      this.attributes[name] = attribute;
      return this;
    }),
    setIndex: jest.fn(function(index) {
      this.index = index;
      return this;
    }),
    getIndex: jest.fn(function() {
      return this.index;
    }),
    getAttribute: jest.fn(function(name) {
      return this.attributes ? this.attributes[name] : undefined;
    }),
    setFromPoints: jest.fn(function(_points) {
      // Mock implementation that returns the geometry for chaining
      return this;
    }),
    computeVertexNormals: jest.fn(function() {
      // Mock implementation that creates a normal attribute
      if (this.attributes && this.attributes.position) {
        const positionCount = this.attributes.position.count;
        const normalArray = new Array(positionCount * 3).fill(0);
        this.attributes.normal = {
          array: normalArray,
          count: positionCount,
          itemSize: 3
        };
      }
      return this;
    }),
    computeBoundingBox: jest.fn(function() {
      this.boundingBox = {
        min: { x: -1, y: -1, z: -1 },
        max: { x: 1, y: 1, z: 1 }
      };
      return this;
    }),
    computeBoundingSphere: jest.fn(),
    addGroup: jest.fn(function(start, count, materialIndex) {
      this.groups = this.groups || [];
      this.groups.push({ start, count, materialIndex });
      return this;
    }),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
    attributes: {},
    index: null,
    groups: [],
    userData: {},
    boundingBox: null,
  })),
  Float32BufferAttribute: jest.fn().mockImplementation((array, itemSize) => ({
    array,
    itemSize,
    count: array.length / itemSize,
    setUsage: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    toJSON: jest.fn(),
  })),
  EdgesGeometry: jest.fn().mockImplementation(() => ({
    computeLineDistances: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
  })),
  LineBasicMaterial: jest.fn().mockImplementation(() => ({
    setValues: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
  })),
  LineDashedMaterial: jest.fn().mockImplementation(() => ({
    setValues: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
    color: 0xffffff,
    opacity: 1,
    transparent: false,
    dashSize: 3,
    gapSize: 1,
  })),
  LineSegments: jest.fn().mockImplementation((geometry, material) => ({
    geometry,
    material,
    type: 'LineSegments',
    add: jest.fn(),
    remove: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
    visible: true,
    children: [],
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { set: jest.fn(), x: 1, y: 1, z: 1 },
    updateMatrix: jest.fn(),
    updateMatrixWorld: jest.fn(),
    ...geometry,
    ...material,
  })),
  Line: jest.fn().mockImplementation((geometry, material) => ({
    geometry,
    material,
    type: 'Line',
    add: jest.fn(),
    remove: jest.fn(),
    clone: jest.fn(),
    copy: jest.fn(),
    dispose: jest.fn(),
    toJSON: jest.fn(),
    visible: true,
    children: [],
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    scale: { set: jest.fn(), x: 1, y: 1, z: 1 },
    updateMatrix: jest.fn(),
    updateMatrixWorld: jest.fn(),
    computeLineDistances: jest.fn(),
  })),
};

// Ensure DEG2RAD is available as both a property and a direct export, and on the default export for ESM compatibility
const DEG2RAD = Math.PI / 180;
THREE.DEG2RAD = DEG2RAD;

// Proxy to avoid undefined property errors for unmocked THREE classes/constants
const handler = {
  get: (target, prop) => {
    if (prop === 'DEG2RAD') return DEG2RAD;
    return prop in target ? target[prop] : jest.fn();
  },
};

const proxiedThree = new Proxy(THREE, handler);

const exportObj = { ...proxiedThree };
exportObj.DEG2RAD = DEG2RAD;
exportObj.default = exportObj; // ESM default export compatibility
module.exports = exportObj;
