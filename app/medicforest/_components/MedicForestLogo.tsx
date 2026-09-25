"use client";

import { useId } from "react";

type MedicForestLogoProps = {
  className?: string;
  markOnly?: boolean;
  onDark?: boolean;
  priority?: boolean;
};

export function MedicForestLogo({
  className = "",
  markOnly = false,
  onDark = false,
}: MedicForestLogoProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const gradForest = `mf_f_${id}`;
  const gradPine = `mf_p_${id}`;

  const medicFill = onDark ? "#FFFFFF" : "#0F172A";

  if (markOnly) {
    return (
      <svg
        viewBox="0 0 44 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        aria-label="MedicForest"
        role="img"
      >
        <defs>
          <linearGradient id={gradPine} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={onDark ? "#34D399" : "#10B981"} />
            <stop offset="45%" stopColor={onDark ? "#10B981" : "#059669"} />
            <stop offset="100%" stopColor={onDark ? "#059669" : "#047857"} />
          </linearGradient>
        </defs>

        <g transform="translate(4, 3)">
          <path
            d="M18 3
               C18 3 13.5 10.5 10 14 C12 14.5 13.8 14.5 14.5 14.5
               C12 18.5 8 22 5.5 24.5 C7.8 25 10 25 11.5 25
               C8 29 4 33 2 34.5 C6.5 34.5 13.5 34.5 16 34.5
               L16 39.5 C16 40 16.5 40.5 17 40.5 L19 40.5 C19.5 40.5 20 40 20 39.5 L20 34.5
               C22.5 34.5 29.5 34.5 34 34.5
               C32 33 28 29 24.5 25 C26 25 28.2 25 30.5 24.5
               C28 22 24 18.5 21.5 14.5 C22.2 14.5 24 14.5 26 14
               C22.5 10.5 18 3 18 3 Z"
            fill={`url(#${gradPine})`}
          />
          <path
            d="M18 3.5 L18 34.5"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 210 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="MedicForest"
      role="img"
    >
      <defs>
        <linearGradient id={gradForest} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={onDark ? "#34D399" : "#059669"} />
          <stop offset="100%" stopColor={onDark ? "#10B981" : "#047857"} />
        </linearGradient>
        <linearGradient id={gradPine} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={onDark ? "#34D399" : "#10B981"} />
          <stop offset="45%" stopColor={onDark ? "#10B981" : "#059669"} />
          <stop offset="100%" stopColor={onDark ? "#059669" : "#047857"} />
        </linearGradient>
      </defs>

      {/* Tree Icon */}
      <g transform="translate(6, 4)">
        <path
          d="M18 3
             C18 3 13.5 10.5 10 14 C12 14.5 13.8 14.5 14.5 14.5
             C12 18.5 8 22 5.5 24.5 C7.8 25 10 25 11.5 25
             C8 29 4 33 2 34.5 C6.5 34.5 13.5 34.5 16 34.5
             L16 39.5 C16 40 16.5 40.5 17 40.5 L19 40.5 C19.5 40.5 20 40 20 39.5 L20 34.5
             C22.5 34.5 29.5 34.5 34 34.5
             C32 33 28 29 24.5 25 C26 25 28.2 25 30.5 24.5
             C28 22 24 18.5 21.5 14.5 C22.2 14.5 24 14.5 26 14
             C22.5 10.5 18 3 18 3 Z"
          fill={`url(#${gradPine})`}
        />
        <path
          d="M18 3.5 L18 34.5"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>

      {/* Wordmark */}
      <text
        x="47"
        y="32"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="24.5"
        letterSpacing="-0.035em"
      >
        <tspan fill={medicFill} fontWeight="600">
          Medic
        </tspan>
        <tspan fill={`url(#${gradForest})`} fontWeight="800">
          Forest
        </tspan>
      </text>
    </svg>
  );
}
