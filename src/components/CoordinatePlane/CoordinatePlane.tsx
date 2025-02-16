//src/components/CoordinatePlane/CoordinatePlane.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

//interface Point {
//  x: number;
//  y: number;
//}

interface CoordinatePlaneProps {
  width?: number;
  height?: number;
  points?: [number, number][];
  visiblePoints?: Set<number>;
  onPointClick?: (index: number) => void;
  fontSize?: number;
  className?: string;
  gridLines?: {
    x: number[];
    y: number[];
  };
  axisLabels?: {
    x: string;
    y: string;
  };
}

const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({
  width = 800,
  height = 600,
  points = [],
  visiblePoints = new Set(),
  onPointClick,
  fontSize = 32,
  className = '',
  gridLines = {
    x: Array.from({ length: 11 }, (_, i) => i),
    y: Array.from({ length: 7 }, (_, i) => i * 5)
  },
  axisLabels = {
    x: 'x',
    y: 'y'
  }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const margin = {
      top: 60,
      right: 120,
      bottom: 80,
      left: 100
    };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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

    // Add axes with larger font size
    const xAxis = d3.axisBottom(xScale)
      .tickSize(12)
      .tickPadding(12);
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(12)
      .tickPadding(12);

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Update tick font sizes
    xAxisGroup.selectAll('.tick text')
      .style('font-size', `${fontSize}px`);
    
    yAxisGroup.selectAll('.tick text')
      .style('font-size', `${fontSize}px`);

    // Add axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .style('font-size', `${fontSize * 1.2}px`)
      .text(axisLabels.x);

    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 30)
      .style('font-size', `${fontSize * 1.2}px`)
      .text(axisLabels.y);

    // Plot points
    points.forEach((point, index) => {
      if (visiblePoints.has(index)) {
        const pointGroup = g.append('g')
          .attr('class', 'point-group')
          .style('cursor', onPointClick ? 'pointer' : 'default')
          .on('click', () => onPointClick?.(index));

        pointGroup.append('circle')
          .attr('cx', xScale(point[0]))
          .attr('cy', yScale(point[1]))
          .attr('r', 8)
          .attr('class', 'point')
          .style('fill', '#0072B2');

        pointGroup.append('text')
          .attr('x', xScale(point[0]) + 20)
          .attr('y', yScale(point[1]) - 20)
          .attr('class', 'point-label')
          .style('font-size', `${fontSize}px`)
          .text(`(${point[0]}, ${point[1]})`);
      }
    });
  }, [width, height, points, visiblePoints, fontSize, gridLines, axisLabels, onPointClick]);

  return (
    <svg 
      ref={svgRef}
      className={`coordinate-plane ${className}`}
      aria-label="Coordinate plane with plotted points"
    />
  );
};

export default CoordinatePlane;