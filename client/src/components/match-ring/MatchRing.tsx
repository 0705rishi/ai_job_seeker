import React, { useEffect, useState } from "react";

interface MatchRingProps {
  score: number;
  size?: "small" | "medium" | "large";
  animate?: boolean;
}

export const MatchRing: React.FC<MatchRingProps> = ({
  score,
  size = "medium",
  animate = true,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Dimensions based on size
  const config = {
    small: { diameter: 40, strokeWidth: 4, fontSize: "text-[10px]" },
    medium: { diameter: 56, strokeWidth: 5, fontSize: "text-xs" },
    large: { diameter: 120, strokeWidth: 8, fontSize: "text-2xl" },
  }[size];

  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Determine color theme based on score
  const getColor = (val: number) => {
    if (val >= 75) return { stroke: "#12B886", text: "text-emerald-600", bg: "bg-emerald-50" }; // emerald
    if (val >= 50) return { stroke: "#F5A524", text: "text-amber-600", bg: "bg-amber-50" }; // amber
    return { stroke: "#F43F5E", text: "text-rose-600", bg: "bg-rose-50" }; // rose
  };

  const colors = getColor(score);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReduced = mediaQuery.matches;

    if (!animate || prefersReduced) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 900; // ms
    const startTime = performance.now();

    let animationFrameId: number;

    const run = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const ease = progress * (2 - progress); // Ease out quad
      const current = Math.round(start + ease * (score - start));
      
      setDisplayScore(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(run);
      }
    };

    animationFrameId = requestAnimationFrame(run);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [score, animate]);

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div 
      className="relative inline-flex items-center justify-center" 
      style={{ width: config.diameter, height: config.diameter }}
    >
      <svg
        width={config.diameter}
        height={config.diameter}
        viewBox={`0 0 ${config.diameter} ${config.diameter}`}
        className="-rotate-90 transform"
      >
        {/* Track circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="transparent"
          stroke="#E6E9F0"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="transparent"
          stroke={colors.stroke}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-75 ease-out"
        />
      </svg>
      {/* Centered text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-mono font-semibold ${config.fontSize} ${colors.text}`}
        >
          {displayScore}%
        </span>
      </div>
    </div>
  );
};

export default MatchRing;
