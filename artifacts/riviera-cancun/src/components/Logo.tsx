type LogoProps = {
  size?: number;
  color?: string;
  className?: string;
};

export function ShipWheelIcon({ size = 36, color = '#C9A84C', className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" stroke={color} strokeWidth="4" />
      {/* Inner hub */}
      <circle cx="50" cy="50" r="10" stroke={color} strokeWidth="4" />
      {/* Center fill */}
      <circle cx="50" cy="50" r="5" fill={color} />
      {/* 8 spokes with handle knobs */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const innerR = 12;
        const outerR = 42;
        const x1 = 50 + innerR * Math.cos(rad);
        const y1 = 50 + innerR * Math.sin(rad);
        const x2 = 50 + outerR * Math.cos(rad);
        const y2 = 50 + outerR * Math.sin(rad);
        const kx = 50 + (outerR + 3) * Math.cos(rad);
        const ky = 50 + (outerR + 3) * Math.sin(rad);
        return (
          <g key={angle}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={kx} cy={ky} r="3.5" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

export function Logo({ size = 36, color = '#C9A84C', className = '' }: LogoProps) {
  return <ShipWheelIcon size={size} color={color} className={className} />;
}
