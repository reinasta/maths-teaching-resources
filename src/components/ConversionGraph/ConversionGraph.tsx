// src/components/ConversionGraph/ConversionGraph.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface ConversionGraphProps {
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
}

interface ConversionData {
  x: number;
  y: number;
  direction: 'inches' | 'cm';
}

const ConversionGraph: React.FC<ConversionGraphProps> = ({
  width = 900,
  height = 700,
  fontSize = 32,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [dimensions, setDimensions] = useState({ width, height });
  const [conversionData, setConversionData] = useState<ConversionData>({
    x: 2,
    y: 5,
    direction: 'inches'
  });

  // Handle resize
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

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { 
      top: 50, 
      right: 100, 
      bottom: 70, 
      left: 120 
    };
    
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up SVG with viewBox
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("aspect-ratio", `${dimensions.width}/${dimensions.height}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 25])
      .range([innerHeight, 0]);

    // Add grid
    g.selectAll("vertical-grid")
      .data(d3.range(0, 11))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight);

    g.selectAll("horizontal-grid")
      .data(d3.range(0, 26, 5))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d));

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const xAxisGroup = g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxisGroup = g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Update tick font sizes
    xAxisGroup.selectAll('.tick text')
      .style('font-size', `${fontSize}px`);
    
    yAxisGroup.selectAll('.tick text')
      .style('font-size', `${fontSize}px`);

    // Add axis labels
    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 10)
      .style('font-size', `${fontSize}px`)
      .text("inches");

    g.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left + 45)
      .style('font-size', `${fontSize}px`)
      .text("centimetres");

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

  }, [dimensions, fontSize, animationKey, conversionData]);

  const handleConversionClick = (inches: number, cm: number, direction: 'inches' | 'cm') => {
    setConversionData({ x: inches, y: cm, direction });
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-8 items-center">
      <div 
        ref={containerRef} 
        className="flex-grow lg:w-2/3 max-w-[70%] relative"
      >
        <svg 
          ref={svgRef}
          className={`coordinate-plane ${className}`}
          aria-label="Conversion graph between inches and centimetres"
        />
      </div>
      <div className="lg:w-1/3 flex items-center">
        <div className="bg-background-light rounded-xl p-5 shadow-sm w-full">
          <div className="button-group">
            <h3 className="text-xl font-medium mb-3">Inches to Centimetres</h3>
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
          
          <div className="button-group mt-6">
            <h3 className="text-xl font-medium mb-3">Centimetres to Inches</h3>
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
    </div>
  );
};

export default ConversionGraph;