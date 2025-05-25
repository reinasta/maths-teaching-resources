import React from 'react';
import { render } from '@testing-library/react';
import TrapezoidalPrism, { createTrapezoidalPrismGeometry } from './TrapezoidalPrism';
jest.mock('three');

describe('TrapezoidalPrism 3D Visualisation', () => {
  const defaultDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };

  it('renders without crashing (folded)', () => {
    const { container } = render(
      <TrapezoidalPrism dimensions={defaultDimensions} isUnfolded={false} visualStyle="solid" />
    );
    expect(container).not.toBeNull();
  });

  it('renders without crashing (unfolded)', () => {
    const { container } = render(
      <TrapezoidalPrism dimensions={defaultDimensions} isUnfolded={true} visualStyle="solid" />
    );
    expect(container).not.toBeNull();
  });

  it('renders with labels when labelConfig is set', () => {
    const { container } = render(
      <TrapezoidalPrism
        dimensions={defaultDimensions}
        isUnfolded={false}
        visualStyle="solid"
        labelConfig={{ showVolume: true, showSurfaceArea: true, showFaces: true }}
        calculations={{ leftSide: 3.6, rightSide: 3.6, volume: 45, surfaceArea: 100 }}
      />
    );
    expect(container).not.toBeNull();
  });
});

describe('createTrapezoidalPrismGeometry', () => {
  const defaultDimensions = { topWidth: 2, bottomWidth: 4, height: 3, depth: 5 };
  it('creates geometry with correct userData', () => {
    const geom = createTrapezoidalPrismGeometry(defaultDimensions, false);
    expect(geom.userData.dimensions).toEqual(defaultDimensions);
    expect(geom.getAttribute('position')).not.toBeNull();
  });
});
