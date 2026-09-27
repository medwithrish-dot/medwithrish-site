"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

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
  buttonClassName = "text-sm font-black text-blue-600 hover:text-blue-700",
  showCopy = true,
}: {
  text: string;
  previewLength?: number;
  className?: string;
  paragraphClassName?: string;
  buttonClassName?: string;
  showCopy?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const cleanText = text.trim();

  const paragraphs = useMemo(
    () =>
      cleanText
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [cleanText]
  );

  const canExpand =
    paragraphs.length > 1 || (paragraphs[0]?.length ?? 0) > previewLength;

  const visibleText =
    canExpand && !expanded ? getPreviewText(cleanText, previewLength) : cleanText;

  const visibleParagraphs = useMemo(
    () =>
      visibleText
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [visibleText]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures gracefully
    }
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {visibleParagraphs.map((paragraph, index) => (
          <p key={index} className={paragraphClassName}>
            {paragraph}
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className={buttonClassName}
          >
            {expanded ? "Show less" : "Show more..."}
          </button>
        )}
        {showCopy && cleanText.length > 0 && (
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            title="Copy feedback to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
