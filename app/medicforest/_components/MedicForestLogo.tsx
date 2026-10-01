"use client";

type MedicForestLogoProps = {
  className?: string;
  markOnly?: boolean;
  onDark?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function MedicForestLogo({
  className = "",
  markOnly = false,
  onDark = false,
  width,
  height,
}: MedicForestLogoProps) {
  if (markOnly) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/brand/medicforest-tree-mark.png"
        alt="MedicForest"
        className={`inline-block shrink-0 object-contain object-left ${className}`}
        width={width ?? 48}
        height={height ?? 48}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={onDark ? "/brand/medicforest-logo-dark.png" : "/brand/medicforest-logo.png"}
      alt="MedicForest"
      className={`inline-block shrink-0 object-contain object-left ${className}`}
      width={width ?? 160}
      height={height ?? 38}
    />
  );
}
