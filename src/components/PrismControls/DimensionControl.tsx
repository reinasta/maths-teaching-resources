import React from 'react';
import { PrismDimensions } from '../Prism/prism.types';

interface DimensionControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const DimensionControl: React.FC<DimensionControlProps> = ({ label, value, onChange, min = 1, max = 5, step = 0.5 }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="dimension-control">
      <label htmlFor={label}>{label}:</label>
      <input
        type="range"
        id={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <input
        type="range"
        id={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <span className="value">{value}</span>
    </div>
  );
};

export default DimensionControl;
