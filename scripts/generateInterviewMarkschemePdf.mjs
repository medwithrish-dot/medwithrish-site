import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const sourcePath = path.join(
  rootDir,
  "public",
  "phloemai",
  "interview-question-markscheme-rubrics.txt"
);
const outputPath = path.join(
  rootDir,
  "public",
  "phloemai",
  "interview-question-markscheme-rubrics.pdf"
);

const pageWidth = 595;
const pageHeight = 842;
const marginX = 42;
const marginY = 42;
const fontSize = 9.5;
const leading = 12;
const maxChars = 88;
const maxLines = Math.floor((pageHeight - marginY * 2) / leading);

function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(line) {
  if (!line.trim()) return [""];

  const bulletPrefix = line.startsWith("- ") ? "- " : "";
  const continuationPrefix = bulletPrefix ? "  " : "";
  const words = line.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxChars) {
      current = next;
      return;
    }

    if (current) {
      lines.push(current);
      current = continuationPrefix ? `${continuationPrefix}${word}` : word;
    } else {
      lines.push(word);
      current = "";
    }
  });

  if (current) lines.push(current);

  return bulletPrefix && lines.length > 1
    ? [lines[0], ...lines.slice(1).map((item) => `${continuationPrefix}${item.trim()}`)]
    : lines;
}

function paginate(lines) {
  const pages = [];
  let currentPage = [];

  lines.forEach((line) => {
    const wrapped = wrapLine(line);

    wrapped.forEach((wrappedLine) => {
      if (currentPage.length >= maxLines) {
        pages.push(currentPage);
        currentPage = [];
      }

      currentPage.push(wrappedLine);
    });
  });

  if (currentPage.length > 0) pages.push(currentPage);

  return pages;
}

function pageStream(lines) {
  const commands = [
    "BT",
    `/F1 ${fontSize} Tf`,
    `${leading} TL`,
    `${marginX} ${pageHeight - marginY} Td`,
  ];

  lines.forEach((line) => {
    commands.push(`(${escapePdfText(line)}) Tj`);
    commands.push("T*");
  });

  commands.push("ET");

  return commands.join("\n");
}

function writePdf(pages) {
  const objects = [];
  const pageObjectIds = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, index) => {
    const pageObjectId = 4 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const stream = pageStream(pageLines);

    pageObjectIds.push(pageObjectId);
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] =
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`;
  });

  objects[2] =
    `<< /Type /Pages /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    const objectBody = objects[objectId];

    if (!objectBody) continue;

    offsets[objectId] = Buffer.byteLength(pdf, "utf8");
    pdf += `${objectId} 0 obj\n${objectBody}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectId = 1; objectId < objects.length; objectId += 1) {
    const offset = offsets[objectId] ?? 0;

    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf +=
    `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;

  fs.writeFileSync(outputPath, pdf);
}

const sourceText = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
const pages = paginate(sourceText.split("\n"));

writePdf(pages);

console.log(`Wrote ${path.relative(rootDir, outputPath)} (${pages.length} pages)`);
