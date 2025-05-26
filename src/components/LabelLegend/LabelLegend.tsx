import React from 'react';
import { LabelConfig } from '../Prism/prism.types';

interface LabelLegendProps {
  labelConfig: LabelConfig;
  prismType?: 'triangular' | 'trapezoidal'; // Added prismType prop
}

const LabelLegend: React.FC<LabelLegendProps> = ({ labelConfig, prismType = 'triangular' }) => {
  if (!labelConfig.showVolume && !labelConfig.showSurfaceArea && !labelConfig.showFaces) {
    return null; // Don't show legend if no labels are active
  }

  const getLegendItems = () => {
    const items: { symbol: string; meaning: string }[] = [];

    if (prismType === 'trapezoidal') {
      if (labelConfig.showVolume) {
        items.push(
          { symbol: 'Wₜ', meaning: 'Width of the top base' },
          { symbol: 'Wᵦ', meaning: 'Width of the bottom base' },
          { symbol: 'H', meaning: 'Height of the trapezoidal base' },
          { symbol: 'D', meaning: 'Depth of the prism (length)' }
        );
      }
      if (labelConfig.showSurfaceArea) {
        // Add Sl and Sr only if not already added by showVolume (to avoid duplicates if both are true)
        // However, the current logic in updateLabels shows Wt, Wb, H, D if EITHER is true,
        // and Sl, Sr only if showSurfaceArea is true. So, legend should reflect that.
        if (!labelConfig.showVolume) { // If only SA is true, add all dimension labels here
          items.push(
            { symbol: 'Wₜ', meaning: 'Width of the top base' },
            { symbol: 'Wᵦ', meaning: 'Width of the bottom base' },
            { symbol: 'H', meaning: 'Height of the trapezoidal base' },
            { symbol: 'D', meaning: 'Depth of the prism (length)' }
          );
        }
        items.push(
          { symbol: 'Sₗ', meaning: 'Length of the left slanted side' },
          { symbol: 'Sᵣ', meaning: 'Length of the right slanted side' }
        );
      }
      if (labelConfig.showFaces) {
        items.push({ symbol: 'F', meaning: 'Face Labels (e.g., Top, Bottom, Front)' });
      }
    } else if (prismType === 'triangular') {
      if (labelConfig.showVolume) {
        items.push({ symbol: 'V', meaning: 'Volume of the prism' });
      }
      if (labelConfig.showSurfaceArea) {
        items.push(
          { symbol: 'A, B, C', meaning: 'Triangle sides' },
          { symbol: 'TH', meaning: 'Triangle height' },
          { symbol: 'PH', meaning: 'Prism height' }
        );
      }
      if (labelConfig.showFaces) {
        items.push({ symbol: 'F1, F2...', meaning: 'Face ID' });
      }
    } else { // Default or other prism types (if any)
      if (labelConfig.showVolume) {
        items.push({ symbol: 'V', meaning: 'Volume of the prism' });
      }
      if (labelConfig.showSurfaceArea) {
        items.push({ symbol: 'SA', meaning: 'Total Surface Area' });
      }
      if (labelConfig.showFaces) {
        items.push({ symbol: 'F', meaning: 'Face Labels (e.g., Top, Bottom, Front)' });
      }
    }
    return items;
  };

  const legendItems = getLegendItems();

  return (
    <div className="label-legend bg-white p-2 rounded shadow-sm text-sm text-gray-700 mt-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {legendItems.map((item, index) => (
          <span key={index} className="px-1 bg-green-100 rounded">
            {item.symbol}: {item.meaning}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LabelLegend;