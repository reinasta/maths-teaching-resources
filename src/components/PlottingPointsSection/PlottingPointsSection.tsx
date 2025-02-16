// src/components/PlottingPointsSection/PlottingPointsSection.tsx
import React, { useRef, useState, useEffect } from 'react';
import CoordinatePlane from '../CoordinatePlane';

interface Point {
  coordinates: [number, number];
  label: string;
  type: 'example' | 'practice';
}

const POINTS: Point[] = [
  { coordinates: [0, 0], label: '(0, 0) - The origin', type: 'example' },
  { coordinates: [5, 15], label: '(5, 15)', type: 'example' },
  { coordinates: [10, 30], label: '(10, 30)', type: 'example' },
  { coordinates: [3, 9], label: '(3, 9)', type: 'practice' },
  { coordinates: [7, 21], label: '(7, 21)', type: 'practice' },
  { coordinates: [8, 24], label: '(8, 24)', type: 'practice' }
];

// Maximum width for the graph container
const MAX_GRAPH_WIDTH = 800;

const PlottingPointsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: MAX_GRAPH_WIDTH,
    height: MAX_GRAPH_WIDTH * 0.75
  });
  const [visiblePoints, setVisiblePoints] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = Math.min(
          containerRef.current.offsetWidth,
          MAX_GRAPH_WIDTH
        );
        const aspectRatio = 0.75; // 4:3 aspect ratio
        
        setDimensions({
          width: containerWidth,
          height: containerWidth * aspectRatio
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handlePointClick = (index: number) => {
    setVisiblePoints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAnswerClick = (index: number) => {
    setUserAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderPointButton = (point: Point, index: number) => {
    const isExample = point.type === 'example';
    const isActive = isExample 
      ? visiblePoints.has(index)
      : userAnswers.has(index);
    
    return (
      <button 
        key={index}
        className={`conversion-button ${isActive ? 'active' : ''}`}
        onClick={() => isExample ? handlePointClick(index) : handleAnswerClick(index)}
        aria-pressed={isActive}
      >
        {point.label}
      </button>
    );
  };

  return (
    <section className="w-full">
      <h2 className="text-h2 mb-6">Practice: Plot These Points</h2>
      
      {/* Updated grid container with vertical centering */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-8 items-center max-w-7xl mx-auto">

        {/* Graph Container */}
        <div 
          ref={containerRef} 
          className="w-full bg-white rounded-lg shadow-sm p-4"
        >
          <CoordinatePlane
            width={dimensions.width}
            height={dimensions.height}
            points={POINTS.map(p => p.coordinates)}
            visiblePoints={new Set([...visiblePoints, ...userAnswers])}
            axisLabels={{ x: 'x', y: 'y' }}
            // Updated margins for larger fonts
            margins={{
              top: 80,
              right: 140,
              bottom: 100,
              left: 120
            }}
            gridLines={{
              x: Array.from({ length: 11 }, (_, i) => i),
              y: Array.from({ length: 7 }, (_, i) => i * 5)
            }}
          />
        </div>

        {/* Controls Container - Now vertically centered */}
        <div className="bg-background-light rounded-xl p-6 shadow-sm self-center">
          {/* Example Points Section */}
          <div className="mb-8">
            <h3 className="text-h3 text-text-dark mb-4">Example Points</h3>
            <div className="space-y-2">
              {POINTS.filter(p => p.type === 'example')
                .map((point, idx) => renderPointButton(point, idx))}
            </div>
          </div>
          
          {/* Practice Points Section */}
          <div>
            <h3 className="text-h3 text-text-dark mb-4">Practice Questions</h3>
            <p className="text-text-muted mb-4">
              Click to identify these points on the graph:
            </p>
            <div className="space-y-2">
              {POINTS.filter(p => p.type === 'practice')
                .map((point, idx) => renderPointButton(point, 
                  idx + POINTS.filter(p => p.type === 'example').length))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlottingPointsSection;