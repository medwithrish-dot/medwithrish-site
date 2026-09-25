import Image from "next/image";

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
  priority = false,
}: MedicForestLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${
        onDark ? "rounded-lg bg-[#f7f7f2] px-2 py-0.5" : ""
      } ${className}`}
    >
      <Image
        src={
          markOnly
            ? "/brand/medicforest-tree-mark.png"
            : "/brand/medicforest-logo.png"
        }
        alt={markOnly ? "" : "MedicForest"}
        width={markOnly ? 729 : 1757}
        height={markOnly ? 1005 : 558}
        className="h-full w-full object-contain"
        priority={priority}
      />
    </span>
  );
}
