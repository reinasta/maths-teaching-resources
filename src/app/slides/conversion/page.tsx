'use client';

import React, { useEffect } from 'react';
import ConversionGraph from '@/components/ConversionGraph/ConversionGraph';
import PlottingPointsSection from '@/components/PlottingPointsSection';

// Move CSS import before dynamic import
import 'reveal.js/dist/reveal.css';

export default function ConversionSlidesPage() {
  useEffect(() => {
    // Initialize Reveal.js only after component mounts
    if (typeof window !== 'undefined') {
      const initializeReveal = async () => {
        try {
          // Import Reveal.js dynamically within the effect
          const Reveal = await import('reveal.js');
          const deck = new Reveal.default({
            width: 1600,
            height: 900,
            margin: 0.1,
            minScale: 0.2,
            maxScale: 2.0,
            center: false,
            hash: true
          });
          await deck.initialize();
        } catch (error) {
          console.error('Failed to initialize Reveal.js:', error);
        }
      };
      
      initializeReveal();
    }
  }, []);

  return (
    <div className="reveal" style={{ fontFamily: 'var(--main-font)' }}>
      <div className="slides conversion-wrapper">
        {/* Title Slide */}
        <section className="conversion-layout">
          <div className="slide-content">
            <h1>Conversion Graphs</h1>
            <p>Tuesday, 15 February 2025</p>
          </div>
        </section>

        {/* Key Words Slide */}
        <section className="conversion-layout">
          <div className="slide-content">
            <h2>Plotting points on the coordinate plane</h2>
            <p>Key words:</p>
            <ul className="key-words">
              <li>x-axis: the horizontal line that goes from left to right</li>
              <li>y-axis: the vertical line that goes from bottom to top</li>
              <li>origin: the point where the x-axis and y-axis meet (0, 0)</li>
              <li>point: a position on the coordinate plane given by two numbers (x, y)</li>
            </ul>
          </div>
        </section>

        {/* Plotting Points Practice Slide */}
        <section className="conversion-layout">
          <PlottingPointsSection />
        </section>

        {/* Interactive Conversion Slide */}
        <section className="conversion-layout">
          <div className="slide-content">
            <h2>Converting between inches and centimetres</h2>
            <ConversionGraph />
          </div>
        </section>

        {/* Summary Slide */}
        <section className="conversion-layout">
          <div className="slide-content">
            <h2>Key Points to Remember</h2>
            <ul className="key-words">
              <li>The conversion graph shows how to convert between inches and centimetres</li>
              <li>Each point on the line represents equivalent measurements</li>
              <li>
                To convert:
                <ul>
                  <li>Start at the value you know</li>
                  <li>Draw a line up (or across) to the conversion line</li>
                  <li>Draw a line across (or up) to find the converted value</li>
                </ul>
              </li>
              <li>1 inch is approximately equal to 2.5 centimetres</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
