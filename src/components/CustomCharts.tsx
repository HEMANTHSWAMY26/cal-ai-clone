import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  Text as SvgText, 
  Defs, 
  LinearGradient, 
  Stop, 
  Rect, 
  Line 
} from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface LineChartProps {
  data: ChartData;
  width: number;
  height: number;
  color: string;
  gradientFrom: string;
  strokeWidth?: number;
}

export function CustomLineChart({
  data,
  width,
  height,
  color,
  gradientFrom,
  strokeWidth = 3
}: LineChartProps) {
  const pointsData = data.datasets[0].data;
  const labels = data.labels;
  const length = pointsData.length;

  // Chart Layout constants
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...pointsData, 100) * 1.15; // Pad max value so line doesn't clip

  // Calculate coordinates
  const points = pointsData.map((val, index) => {
    const x = paddingLeft + (index / (length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  // Generate SVG Path for line
  let linePath = '';
  let fillPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    fillPath = `M ${points[0].x} ${paddingTop + chartHeight} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      // Draw straight line segments with smooth round joins
      linePath += ` L ${points[i].x} ${points[i].y}`;
      fillPath += ` L ${points[i].x} ${points[i].y}`;
    }

    fillPath += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
  }

  // Horizontal Grid Lines
  const gridLinesCount = 3;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const val = (maxVal / (gridLinesCount - 1)) * i;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { y, val: Math.round(val) };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={gradientFrom} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={gradientFrom} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines & Y-axis labels */}
        {gridLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <Line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="#1E1E1E"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <SvgText
              x={paddingLeft - 8}
              y={line.y + 4}
              fill="#A1A1AA"
              fontSize="9"
              fontWeight="bold"
              textAnchor="end"
            >
              {line.val}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Gradient Area Fill under line */}
        {fillPath !== '' && (
          <Path d={fillPath} fill="url(#chartGrad)" />
        )}

        {/* Main Line Stroke */}
        {linePath !== '' && (
          <Path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points (Circles) */}
        {points.map((pt, idx) => (
          <Circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="4.5"
            fill={color}
            stroke="#111111"
            strokeWidth="1.5"
          />
        ))}

        {/* X-Axis labels */}
        {points.map((pt, idx) => (
          <SvgText
            key={`lbl-${idx}`}
            x={pt.x}
            y={height - 8}
            fill="#A1A1AA"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
          >
            {labels[idx] || ''}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

interface BarChartProps {
  data: ChartData;
  width: number;
  height: number;
}

export function CustomBarChart({
  data,
  width,
  height
}: BarChartProps) {
  const pointsData = data.datasets[0].data;
  const labels = data.labels;
  const length = pointsData.length;

  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...pointsData, 50) * 1.1;

  const barWidth = 28;
  const barSpacing = chartWidth / length;

  // Custom colors for Protein, Carbs, Fat
  const barColors = ['#22C55E', '#3B82F6', '#FF453A'];

  // Calculate bars
  const bars = pointsData.map((val, index) => {
    const x = paddingLeft + index * barSpacing + (barSpacing - barWidth) / 2;
    const barHeight = (val / maxVal) * chartHeight;
    const y = paddingTop + chartHeight - barHeight;
    return { x, y, barHeight, val, color: barColors[index % barColors.length] };
  });

  // Grid Lines
  const gridLinesCount = 3;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const val = (maxVal / (gridLinesCount - 1)) * i;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { y, val: Math.round(val) };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height}>
        {/* Horizontal Grid lines */}
        {gridLines.map((line, idx) => (
          <React.Fragment key={idx}>
            <Line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="#1E1E1E"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <SvgText
              x={paddingLeft - 8}
              y={line.y + 4}
              fill="#A1A1AA"
              fontSize="9"
              fontWeight="bold"
              textAnchor="end"
            >
              {line.val}g
            </SvgText>
          </React.Fragment>
        ))}

        {/* Bars */}
        {bars.map((bar, idx) => (
          <React.Fragment key={idx}>
            {/* Background pill/track */}
            <Rect
              x={bar.x}
              y={paddingTop}
              width={barWidth}
              height={chartHeight}
              rx="6"
              ry="6"
              fill="#181818"
            />
            
            {/* Active Bar */}
            {bar.barHeight > 0 && (
              <Rect
                x={bar.x}
                y={bar.y}
                width={barWidth}
                height={bar.barHeight}
                rx="6"
                ry="6"
                fill={bar.color}
              />
            )}
            
            {/* Value text above bar */}
            <SvgText
              x={bar.x + barWidth / 2}
              y={bar.y - 6}
              fill="#FFFFFF"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              {bar.val}g
            </SvgText>
          </React.Fragment>
        ))}

        {/* X-Axis labels */}
        {bars.map((bar, idx) => (
          <SvgText
            key={`lbl-${idx}`}
            x={bar.x + barWidth / 2}
            y={height - 8}
            fill="#A1A1AA"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
          >
            {labels[idx] || ''}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
