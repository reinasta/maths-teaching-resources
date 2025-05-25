// __mocks__/three/examples/jsm/controls/OrbitControls.js
class OrbitControls {
  constructor() {
    this.enableDamping = false;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minDistance = 0;
    this.maxDistance = 1000;
    this.update = jest.fn();
  }
}

module.exports = { OrbitControls };
