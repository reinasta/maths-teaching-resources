import React from 'react';
import { LabelConfig } from '../Prism/prism.types';

interface LabelConfigControlProps {
  labelConfig: LabelConfig;
  onLabelConfigChange: (key: keyof LabelConfig) => void;
}

const LabelConfigControl: React.FC<LabelConfigControlProps> = ({ labelConfig, onLabelConfigChange }) => {
  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold mb-2">Labels</h4>
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            id="volume-labels"
            type="checkbox"
            checked={labelConfig.showVolume}
            onChange={() => onLabelConfigChange('showVolume')}
            className="mr-2"
          />
          Volume Labels
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={labelConfig.showSurfaceArea}
            onChange={() => onLabelConfigChange('showSurfaceArea')}
            className="mr-2"
          />
          Surface Area Labels
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={labelConfig.showFaces}
            onChange={() => onLabelConfigChange('showFaces')}
            className="mr-2"
          />
          Face Labels
        </label>
      </div>
    </div>
  );
};

export default LabelConfigControl;
