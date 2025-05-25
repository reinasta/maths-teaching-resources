import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  calculateCoordinatePlaneMargins,
  calculateResponsiveFontSize,
  calculateInnerDimensions,
  createScaleConfig,
  calculateResponsiveTickSizes,
  generateGridLines,
  calculateAxisLabelPositions,
  calculateViewBox,
  type DimensionConfig
} from '@/utils/d3/coordinateCalculations';

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

    // Create dimension configuration
    const dimensions: DimensionConfig = { width, height };

    // Calculate responsive dimensions and styling using pure functions
    const margins = calculateCoordinatePlaneMargins(width, height);
    const baseFontSize = calculateResponsiveFontSize(width, height);
    const innerDimensions = calculateInnerDimensions(dimensions, margins);

    // Create scale configurations
    const xScaleConfig = createScaleConfig(0, 10, 0, innerDimensions.width);
    const yScaleConfig = createScaleConfig(0, 30, innerDimensions.height, 0);

    // Generate grid lines
    const gridLines = generateGridLines(0, 10, 1, 0, 30, 5);

    // Calculate responsive tick sizes
    const tickSizes = calculateResponsiveTickSizes(width, height);

    // Calculate axis label positions
    const axisLabels = calculateAxisLabelPositions(
      innerDimensions,
      margins,
      baseFontSize,
      'x',
      'y'
    );

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up SVG with viewBox for better responsiveness
    const viewBoxValue = calculateViewBox(width, height);
    const svg = d3.select(svgRef.current)
      .attr('viewBox', viewBoxValue)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const g = svg.append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    // Create scales using configurations
    const xScale = d3.scaleLinear()
      .domain([xScaleConfig.domainMin, xScaleConfig.domainMax])
      .range([xScaleConfig.rangeMin, xScaleConfig.rangeMax]);

    const yScale = d3.scaleLinear()
      .domain([yScaleConfig.domainMin, yScaleConfig.domainMax])
      .range([yScaleConfig.rangeMin, yScaleConfig.rangeMax]);

    // Add grid using generated grid lines
    g.selectAll('.vertical-grid')
      .data(gridLines.x)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerDimensions.height);

    g.selectAll('.horizontal-grid')
      .data(gridLines.y)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerDimensions.width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d));

    // Add axes with responsive sizes
    const xAxis = d3.axisBottom(xScale)
      .tickSize(tickSizes.tickSize)
      .tickPadding(tickSizes.tickPadding);
    
    const yAxis = d3.axisLeft(yScale)
      .tickSize(tickSizes.tickSize)
      .tickPadding(tickSizes.tickPadding);

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerDimensions.height})`)
      .call(xAxis);

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Update tick font sizes
    xAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);
    
    yAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);

    // Add axis labels using calculated positions
    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', axisLabels.xPosition.x)
      .attr('y', axisLabels.xPosition.y)
      .style('font-size', `${baseFontSize * 1.2}px`)
      .text(axisLabels.xLabel);

    g.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', axisLabels.yPosition.x)
      .attr('y', axisLabels.yPosition.y)
      .style('font-size', `${baseFontSize * 1.2}px`)
      .text(axisLabels.yLabel);

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
      data-testid="coordinate-plane-canvas"
      ref={svgRef}
      className={`coordinate-plane ${className}`}
      aria-label="Coordinate plane with plotted points"
      style={{ aspectRatio: '1.15' }}
    />
  );
};

export default CoordinatePlane;