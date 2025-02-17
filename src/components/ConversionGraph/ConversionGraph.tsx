// src/components/ConversionGraph/ConversionGraph.tsx
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';

interface ConversionGraphProps {
  className?: string;
}

const ConversionGraph: React.FC<ConversionGraphProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [animationKey, setAnimationKey] = useState(0);
  const [conversionData, setConversionData] = useState({
    x: 2,
    y: 5,
    direction: 'inches' as const
  });

    const handleConversionClick = useCallback((inches: number, cm: number, direction: 'inches' | 'cm') => {
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

    // Calculate responsive margins and font sizes
    const margin = {
      top: Math.max(40, dimensions.height * 0.1),
      right: Math.max(20, dimensions.width * 0.05),
      bottom: Math.max(40, dimensions.height * 0.1),
      left: Math.max(40, dimensions.width * 0.08)
    };

    const baseFontSize = Math.min(dimensions.width, dimensions.height) * 0.025;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up SVG with viewBox
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, dimensions.width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 25])
      .range([dimensions.height - margin.top - margin.bottom, 0]);

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${dimensions.height - margin.top - margin.bottom})`)
      .call(xAxis);

    const yAxisGroup = g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    xAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);
    
    yAxisGroup.selectAll('.tick text')
      .style('font-size', `${baseFontSize}px`);

    // Add axis labels with adjusted positions
    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", (dimensions.width - margin.left - margin.right) / 2)
      .attr("y", dimensions.height - margin.top - margin.bottom + baseFontSize * 4)
      .style('font-size', `${baseFontSize}px`)
      .text("inches");

    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -(dimensions.height - margin.top - margin.bottom) / 2)
      .attr("y", -margin.left + baseFontSize)
      .style('font-size', `${baseFontSize}px`)
      .text("centimetres");

    // Add grid
    // Vertical grid lines
    g.selectAll(".vertical-grid")
      .data(d3.range(0, gridConfig.xTicks + 1))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", dimensions.height - margin.top - margin.bottom);

    // Horizontal grid lines
    g.selectAll(".horizontal-grid")
      .data(d3.range(0, 26, gridConfig.yStep))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", dimensions.width - margin.left - margin.right)
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

  }, [dimensions, conversionData, animationKey]);

  return (
    // Remove the extra wrapper div that's adding spacing
    <div className="conversion-layout">
      <div 
        ref={containerRef} 
        className="graph-container"
      >
        <svg 
          ref={svgRef}
          className={`coordinate-plane ${className}`}
          aria-label="Conversion graph between inches and centimetres"
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