import React from 'react';

type Props = {
  word: string;
  fill: string;
  fontSize?: number;
};

/**
 * StroopWordSVG
 * Renders the word as an SVG text element with a solid outline (stroke).
 * This produces a crisp, device-independent outline that works the same on mobile.
 */
const StroopWordSVG: React.FC<Props> = ({ word, fill, fontSize = 48 }) => {
  // Choose a viewBox width that can handle typical short words; scale via fontSize
  const height = fontSize * 3;
  const width = Math.max(200, 5 * fontSize);

  return (
    <svg
      width="100%"
      // Let the SVG scale responsively while keeping the text centered
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={word}
      style={{ display: 'block', margin: '40px auto', maxWidth: '100%' }}
    >
      <rect width={width} height={height} x="0" y="0" fill="#C4C4C4" />

      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontFamily="inherit" fontWeight={700} fontSize={fontSize} fill={fill}>
        {word}
      </text>
    </svg>
  );
};

export default StroopWordSVG;
