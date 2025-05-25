export class OrbitControls {
  constructor(object, domElement) {
    this.object = object;
    this.domElement = domElement;
    this.enableDamping = false;
    this.dampingFactor = 0;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.target = { set: jest.fn(), x: 0, y: 0, z: 0, copy: jest.fn(), clone: jest.fn() };
  }
  update() {}
  dispose() {}
  addEventListener() {}
  removeEventListener() {}
}
