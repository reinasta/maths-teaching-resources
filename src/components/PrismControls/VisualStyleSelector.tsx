import React from 'react';
import { VisualStyle } from '../Prism/prism.types';

interface VisualStyleSelectorProps {
  visualStyle: VisualStyle;
  onVisualStyleChange: (style: VisualStyle) => void;
}

const VisualStyleSelector: React.FC<VisualStyleSelectorProps> = ({ visualStyle, onVisualStyleChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onVisualStyleChange(event.target.value as VisualStyle);
  };

  return (
    <div className="visual-style-selector">
      <label htmlFor="visualStyle" className="block text-sm font-medium mb-1">Visual Style:</label>
      <select
        id="visualStyle"
        value={visualStyle}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="solid">Solid</option>
        <option value="colored">Colored Faces</option>
        <option value="wireframe">Wireframe</option>
      </select>
    </div>
  );
};

export default VisualStyleSelector;
