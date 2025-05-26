import React, { useRef } from 'react';
import { 
  PrismProps,
  DEFAULT_LABEL_CONFIG 
} from './prism.types';
import { usePrismEffects } from './usePrismEffects';

const Prism: React.FC<PrismProps> = ({ 
  dimensions, 
  isUnfolded = false,
  visualStyle = 'solid',
  labelConfig = DEFAULT_LABEL_CONFIG
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  usePrismEffects(
    containerRef,
    dimensions,
    isUnfolded,
    visualStyle,
    labelConfig
  );

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '400px', position: 'relative' }} 
    />
  );
};

export default Prism;