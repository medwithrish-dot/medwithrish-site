"use client";

import { useMemo, useState } from "react";

function getPreviewText(text: string, previewLength: number) {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim());
  const firstParagraph = paragraphs.find(Boolean) ?? text;

  if (firstParagraph.length <= previewLength) return firstParagraph;

  const clipped = firstParagraph.slice(0, previewLength);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${clipped.slice(0, lastSpace > 80 ? lastSpace : previewLength).trim()}...`;
}

export function ExpandableAiFeedback({
  text,
  previewLength = 360,
  className = "mt-4",
  paragraphClassName = "whitespace-pre-wrap",
  buttonClassName = "mt-4 text-sm font-black text-blue-600 hover:text-blue-700",
}: {
  text: string;
  previewLength?: number;
  className?: string;
  paragraphClassName?: string;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const cleanText = text.trim();
  const paragraphs = useMemo(
    () => cleanText.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    [cleanText]
  );
  const canExpand =
    paragraphs.length > 1 || (paragraphs[0]?.length ?? 0) > previewLength;
  const visibleText =
    canExpand && !expanded ? getPreviewText(cleanText, previewLength) : cleanText;
  const visibleParagraphs = visibleText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      <div className="space-y-2">
        {visibleParagraphs.map((paragraph, index) => (
          <p key={index} className={paragraphClassName}>
            {paragraph}
          </p>
        ))}
      </div>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={buttonClassName}
        >
          {expanded ? "Show less" : "Show more..."}
        </button>
      )}
    </div>
  );
}
