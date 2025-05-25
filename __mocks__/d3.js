// __mocks__/d3.js
const chainable = {};
const chainMethods = [
  'select', 'selectAll', 'append', 'attr', 'style', 'text', 'remove', 'data', 'enter', 'exit', 'call', 'on', 'transition', 'duration', 'ease', 'scaleLinear', 'scaleBand', 'range', 'domain', 'nice', 'tickFormat', 'ticks',
];
chainMethods.forEach(m => { chainable[m] = () => chainable; });
chainable.ticks = () => [];
chainable.event = {};

function axisMock() {
  return {
    tickSize: () => axisMock(),
    tickPadding: () => axisMock(),
    scale: () => axisMock(),
    ticks: () => [],
    ...chainable,
  };
}
chainable.axisBottom = () => axisMock();
chainable.axisLeft = () => axisMock();

// Helper to create a deeply chainable proxy for d3 mocks
function createChainableProxy(depth = 0) {
  // Limit depth to avoid infinite recursion in Jest's module mocker
  if (depth > 10) return chainable;
  return new Proxy(function () { return chainable; }, {
    get: (target, prop) => {
      if (prop in chainable) return chainable[prop];
      // Always return a new chainable proxy for any property, but limit depth
      return createChainableProxy(depth + 1);
    },
    apply: () => chainable,
  });
}

const d3 = { ...chainable };
d3.select = createChainableProxy();
d3.selectAll = createChainableProxy();
chainable.select = createChainableProxy();
chainable.selectAll = createChainableProxy();

// Proxy to always return chainable for any missing property
const handler = {
  get: (target, prop) => (prop in target ? target[prop] : createChainableProxy()),
};

module.exports = new Proxy(d3, handler);
