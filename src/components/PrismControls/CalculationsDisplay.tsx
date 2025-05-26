import React from 'react';

interface CalculationsDisplayProps {
  triangleHeight: number;
  surfaceArea: number;
  volume: number;
}

const CalculationsDisplay: React.FC<CalculationsDisplayProps> = ({ triangleHeight, surfaceArea, volume }) => {
  return (
    <div className="calculations">
      <h3 className="text-lg font-semibold mb-3">Calculations</h3>
      <div className="space-y-2">
        <div className="calculation-row">
          <span>Triangle Height:</span>
          <span className="font-mono">{triangleHeight.toFixed(2)} units</span>
        </div>
        <div className="calculation-row">
          <span>Surface Area:</span>
          <span className="font-mono">{surfaceArea.toFixed(2)} sq units</span>
        </div>
        <div className="calculation-row">
          <span>Volume:</span>
          <span className="font-mono">{volume.toFixed(2)} cubic units</span>
        </div>
      </div>
    </div>
  );
};

export default CalculationsDisplay;
