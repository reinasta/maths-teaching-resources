// src/components/CoordinatePlane/CoordinatePlane.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface CoordinatePlaneProps {
  width?: number;
  height?: number;
  points?: [number, number][];
  visiblePoints?: Set<number>;
  onPointClick?: (index: number) => void;
  className?: string;
  gridLines?: {
    x: number[];
    y: number[];
  };
  axisLabels?: {
    x: string;
    y: string;
  };
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({
  width = 800,
  height = 600,
  points = [],
  visiblePoints = new Set(),
  onPointClick,
  className = '',
  gridLines = {
    x: Array.from({ length: 11 }, (_, i) => i),
    y: Array.from({ length: 7 }, (_, i) => i * 5)
  },
  axisLabels = {
    x: 'x',
    y: 'y'
  },
  // Increased margins to accommodate larger font sizes
  margins = {
    top: 80,    // Increased from 60
    right: 140,  // Increased from 120
    bottom: 100, // Increased from 80
    left: 120    // Increased from 100
  }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('class', `coordinate-plane ${className}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 30])
      .range([innerHeight, 0]);

    // Add grid
    g.selectAll('.vertical-grid')
      .data(gridLines.x)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight);

    g.selectAll('.horizontal-grid')
      .data(gridLines.y)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d));

    // Add axes with larger ticks and padding
    const xAxis = d3.axisBottom(xScale)
      .tickSize(8)        // Increased from 6
      .tickPadding(12);   // Increased from 8
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(8)
      .tickPadding(12);

    // Add x-axis
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    // Add y-axis
    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis labels with adjusted positioning
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margins.bottom - 20)  // Adjusted for larger font
      .text(axisLabels.x);

    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margins.left + 40)  // Adjusted for larger font
      .text(axisLabels.y);

    // Plot points with adjusted spacing for larger labels
    points.forEach((point, index) => {
      if (visiblePoints.has(index)) {
        const pointGroup = g.append('g')
          .attr('class', 'point-group')
          .style('cursor', onPointClick ? 'pointer' : 'default')
          .on('click', () => onPointClick?.(index));

        pointGroup.append('circle')
          .attr('cx', xScale(point[0]))
          .attr('cy', yScale(point[1]))
          .attr('r', 6)
          .attr('class', 'point')
          .style('fill', 'var(--primary-color)');

        pointGroup.append('text')
          .attr('x', xScale(point[0]) + 15)  // Increased offset for larger font
          .attr('y', yScale(point[1]) - 15)   // Increased offset for larger font
          .attr('class', 'point-label')
          .text(`(${point[0]}, ${point[1]})`);
      }
    });

  }, [width, height, points, visiblePoints, className, gridLines, axisLabels, margins, onPointClick]);

  return (
    <svg 
      ref={svgRef}
      className={`coordinate-plane ${className}`}
      aria-label="Coordinate plane with plotted points"
    />
  );
};

export default CoordinatePlane;