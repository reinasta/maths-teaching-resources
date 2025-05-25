// src/components/ConversionGraph/ConversionGraph.tsx
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import {
  calculateConversionGraphMargins,
  calculateResponsiveFontSize,
  calculateInnerDimensions,
  createScaleConfig,
  calculateAxisLabelPositions,
  calculateViewBox,
  generateGridLines
} from '@/utils/d3/coordinateCalculations';

interface ConversionGraphProps {
  className?: string;
}

// Define the type for conversion direction
type ConversionDirection = 'inches' | 'cm';

// Define the interface for conversion data
interface ConversionData {
  x: number;
  y: number;
  direction: ConversionDirection;
}

const ConversionGraph: React.FC<ConversionGraphProps> = ({ className: _className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [animationKey, setAnimationKey] = useState(0);
  const [conversionData, setConversionData] = useState<ConversionData>({
    x: 2,
    y: 5,
    direction: 'inches'
  });

  const handleConversionClick = useCallback((inches: number, cm: number, direction: ConversionDirection) => {
    setConversionData({ x: inches, y: cm, direction });
    setAnimationKey(prev => prev + 1);
  }, []);

  // Calculate dimensions based on container size
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const width = container.clientWidth;
      // Adjust height calculation based on screen width
      const heightRatio = window.innerWidth <= 480 ? 0.850 : 0.75; // 10% increase for phones
      const height = width * heightRatio;
      setDimensions({ width, height });
    }
  }, []);

  // Initialize dimensions and handle resize
  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  const gridConfig = useMemo(() => ({
      xTicks: 10,
      yTicks: 5,
      xStep: 1,
      yStep: 5
  }), []);

  // D3 rendering with responsive considerations
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Calculate responsive dimensions and styling using pure functions
    const margins = calculateConversionGraphMargins(dimensions.width, dimensions.height);
    const baseFontSize = calculateResponsiveFontSize(dimensions.width, dimensions.height);
    const innerDimensions = calculateInnerDimensions(dimensions, margins);

    // Create scale configurations
    const xScaleConfig = createScaleConfig(0, 10, 0, innerDimensions.width);
    const yScaleConfig = createScaleConfig(0, 25, innerDimensions.height, 0);

    // Generate grid lines
    const gridLines = generateGridLines(0, gridConfig.xTicks, gridConfig.xStep, 0, 25, gridConfig.yStep);

    // Calculate axis label positions
    const axisLabels = calculateAxisLabelPositions(
      innerDimensions,
      margins,
      baseFontSize,
      'inches',
      'centimetres'
    );

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up SVG with viewBox
    const viewBoxValue = calculateViewBox(dimensions.width, dimensions.height);
    const svg = d3.select(svgRef.current)
      .attr("viewBox", viewBoxValue)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto");

    const g = svg.append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);

    // Create scales using configurations
    const xScale = d3.scaleLinear()
      .domain([xScaleConfig.domainMin, xScaleConfig.domainMax])
      .range([xScaleConfig.rangeMin, xScaleConfig.rangeMax]);

    const yScale = d3.scaleLinear()
      .domain([yScaleConfig.domainMin, yScaleConfig.domainMax])
      .range([yScaleConfig.rangeMin, yScaleConfig.rangeMax]);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerDimensions.height})`)
      .call(xAxis);

    const yAxisGroup = g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    xAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);
    
    yAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);

    // Add axis labels using calculated positions
    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", axisLabels.xPosition.x)
      .attr("y", axisLabels.xPosition.y)
      .style('font-size', `${baseFontSize}px`)
      .text(axisLabels.xLabel);

    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", axisLabels.yPosition.x)
      .attr("y", axisLabels.yPosition.y)
      .style('font-size', `${baseFontSize}px`)
      .text(axisLabels.yLabel);

    // Add grid using generated grid lines
    // Vertical grid lines
    g.selectAll(".vertical-grid")
      .data(gridLines.x)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerDimensions.height);

    // Horizontal grid lines
    g.selectAll(".horizontal-grid")
      .data(gridLines.y)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerDimensions.width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d));

    // Ensure grid lines are behind other elements
    g.selectAll(".grid-line").lower();

    // Draw conversion line
    g.append("line")
      .attr("class", "conversion-line")
      .attr("x1", xScale(0))
      .attr("y1", yScale(0))
      .attr("x2", xScale(10))
      .attr("y2", yScale(25));

    // Draw helper lines based on direction
    if (conversionData.direction === 'inches') {
      // Inches to cm animation
      const verticalLine = g.append("line")
        .attr("class", "helper-line")
        .attr("x1", xScale(conversionData.x))
        .attr("x2", xScale(conversionData.x))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0));

      const horizontalLine = g.append("line")
        .attr("class", "helper-line")
        .attr("x1", xScale(conversionData.x))
        .attr("x2", xScale(conversionData.x))
        .attr("y1", yScale(conversionData.y))
        .attr("y2", yScale(conversionData.y))
        .style("opacity", 0);

      verticalLine.transition()
        .delay(500)
        .duration(1500)
        .attr("y2", yScale(conversionData.y));

      horizontalLine.transition()
        .delay(2000)
        .duration(1500)
        .style("opacity", 1)
        .attr("x1", xScale(0));
    } else {
      // Cm to inches animation
      const horizontalLine = g.append("line")
        .attr("class", "helper-line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y1", yScale(conversionData.y))
        .attr("y2", yScale(conversionData.y));

      const verticalLine = g.append("line")
        .attr("class", "helper-line")
        .attr("x1", xScale(conversionData.x))
        .attr("x2", xScale(conversionData.x))
        .attr("y1", yScale(conversionData.y))
        .attr("y2", yScale(conversionData.y))
        .style("opacity", 0);

      horizontalLine.transition()
        .delay(500)
        .duration(1500)
        .attr("x2", xScale(conversionData.x));

      verticalLine.transition()
        .delay(2000)
        .duration(1500)
        .style("opacity", 1)
        .attr("y2", yScale(0));
    }

    // Add point at intersection
    const intersectionPoint = g.append("circle")
      .attr("cx", xScale(conversionData.x))
      .attr("cy", yScale(conversionData.y))
      .attr("r", 4)
      .attr("fill", "var(--primary-color)")
      .style("opacity", 0);

    intersectionPoint.transition()
      .delay(1750)
      .duration(500)
      .style("opacity", 1);

  }, [dimensions, conversionData, animationKey, gridConfig.xTicks, gridConfig.xStep, gridConfig.yStep]);

  return (
    // Remove the extra wrapper div that's adding spacing
    <div className="conversion-layout">
      <div 
        ref={containerRef} 
        className="graph-container"
      >
        <svg
          data-testid="conversion-graph-canvas"
          ref={svgRef}
          aria-label="Conversion graph between inches and centimetres"
          className="coordinate-plane "
        />
      </div>
      <div className="controls-container">
        {/* Reduce margin between button groups */}
        <div className="button-group" style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Inches to Centimetres</h3>
          <button 
            className="conversion-button" 
            onClick={() => handleConversionClick(2, 5, 'inches')}
          >
            2 inches → 5 cm
          </button>
          <button 
            className="conversion-button"
            onClick={() => handleConversionClick(4, 10, 'inches')}
          >
            4 inches → 10 cm
          </button>
          <button 
            className="conversion-button"
            onClick={() => handleConversionClick(8, 20, 'inches')}
          >
            8 inches → 20 cm
          </button>
        </div>
        
        <div className="button-group" style={{ marginBottom: '0' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Centimetres to Inches</h3>
           <button 
            className="conversion-button"
            onClick={() => handleConversionClick(2, 5, 'cm')}
          >
            5 cm → 2 inches
          </button>
          <button 
            className="conversion-button"
            onClick={() => handleConversionClick(4, 10, 'cm')}
          >
            10 cm → 4 inches
          </button>
          <button 
            className="conversion-button"
            onClick={() => handleConversionClick(8, 20, 'cm')}
          >
            20 cm → 8 inches
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionGraph;