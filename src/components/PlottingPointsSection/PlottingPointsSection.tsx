// src/components/PlottingPointsSection/PlottingPointsSection.tsx
import React, { useRef, useState, useEffect } from 'react';
import CoordinatePlane from '../CoordinatePlane';

interface Dimensions {
  width: number;
  height: number;
}

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

const PlottingPointsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 800,
    height: 600
  });
  const [visiblePoints, setVisiblePoints] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setDimensions({
          width: containerWidth,
          height: Math.min(containerWidth * 0.75, window.innerHeight * 0.85)
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

  const renderButton = (point: Point, index: number) => {
    const isExample = point.type === 'example';
    const isActive = isExample 
      ? visiblePoints.has(index)
      : userAnswers.has(index);
    
    return (
      <button 
        key={index}
        className={`conversion-button ${isActive ? 'active' : ''}`}
        onClick={() => isExample ? handlePointClick(index) : handleAnswerClick(index)}
      >
        {point.label}
      </button>
    );
  };

  return (
    <section className="w-full px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center lg:text-left">
        Practice: Plot These Points
      </h2>
      <div className="conversion-wrapper">
        <div className="conversion-layout">
          <div 
            ref={containerRef} 
            className="graph-container"
          >
            <CoordinatePlane
              width={dimensions.width}
              height={dimensions.height}
              points={POINTS.map(p => p.coordinates)}
              visiblePoints={new Set([...visiblePoints, ...userAnswers])}
            />
          </div>
          <div className="controls-container">
            <div className="button-group">
              <h3>Example Points</h3>
              {POINTS.filter(p => p.type === 'example')
                .map((point, idx) => renderButton(point, idx))}
            </div>
            
            <div className="button-group">
              <h3>Practice Questions</h3>
              <p className="text-text-muted mb-3">
                Click to identify these points on the graph:
              </p>
              {POINTS.filter(p => p.type === 'practice')
                .map((point, idx) => renderButton(point, idx + POINTS.filter(p => p.type === 'example').length))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlottingPointsSection;