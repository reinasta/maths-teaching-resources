import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface CoordinatePlaneProps {
  width?: number;
  height?: number;
  points?: [number, number][];
  visiblePoints?: Set<number>;
  onPointClick?: (index: number) => void;
  className?: string;
}

const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({
  width = 800,
  height = 600 * 1.15, // 15% taller
  points = [],
  visiblePoints = new Set(),
  onPointClick,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Calculate responsive margins and font sizes
    const margin = {
      top: Math.max(45, height * 0.1),
      right: Math.max(25, width * 0.05),
      bottom: Math.max(50, height * 0.12),
      left: Math.max(50, width * 0.1)
    };

    const baseFontSize = Math.min(width, height) * 0.025;
    
    // Define grid lines
    const gridLines = {
      x: d3.range(0, 11, 1),
      y: d3.range(0, 31, 5)
    };

    // Define axis labels
    const axisLabels = {
      x: 'x',
      y: 'y'
    };

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up SVG with viewBox for better responsiveness
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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

    // Calculate responsive tick sizes
    const tickSize = Math.min(12, Math.max(6, width * 0.015));
    const tickPadding = Math.min(12, Math.max(6, width * 0.015));

    // Add axes with responsive sizes
    const xAxis = d3.axisBottom(xScale)
      .tickSize(tickSize)
      .tickPadding(tickPadding);
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(tickSize)
      .tickPadding(tickPadding);

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Update tick font sizes
    xAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);
    
    yAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);

    // Add axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - (baseFontSize / 2))
      .style('font-size', `${baseFontSize * 1.2}px`)
      .text(axisLabels.x);

    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + (baseFontSize * 2))
      .style('font-size', `${baseFontSize * 1.2}px`)
      .text(axisLabels.y);

    // Update point rendering
    const pointGroups = g.selectAll('.point-group')
      .data(points)
      .enter()
      .append('g')
      .attr('class', 'point-group')
      .style('opacity', (_, i) => visiblePoints.has(i) ? 1 : 0);

    // Add points with properly typed event handler
    pointGroups.append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d[0]))
      .attr('cy', d => yScale(d[1]))
      .on('click', (event: Event, d: [number, number]) => {
        if (onPointClick) {
          event.preventDefault();
          event.stopPropagation();
          const index = points.findIndex(p => p[0] === d[0] && p[1] === d[1]);
          onPointClick(index);
        }
      });

    // Add point labels with dynamic positioning
    pointGroups.append('text')
      .attr('class', 'point-label')
      .attr('text-anchor', d => d[0] === 0 ? 'start' : 'middle')
      .attr('x', d => {
        if (d[0] === 0) {
          return xScale(d[0]) + baseFontSize
        }
        return xScale(d[0])
      })
      .attr('y', d => {
        if (d[0] === 0) {
          return yScale(d[1]) - baseFontSize
        }
        return yScale(d[1]) - baseFontSize * 1.5
      })
      .style('font-size', `${baseFontSize}px`)
      .text(d => `(${d[0]}, ${d[1]})`);

  }, [width, height, points, visiblePoints, onPointClick]);

  return (
    <svg 
      ref={svgRef}
      className={`coordinate-plane ${className}`}
      aria-label="Coordinate plane with plotted points"
      style={{ aspectRatio: '1.15' }}
    />
  );
};

export default CoordinatePlane;