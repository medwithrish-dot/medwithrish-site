import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

function createSvg({
  mode = "dark",
  markOnly = false,
  width = 420,
  height = 96,
} = {}) {
  const isDark = mode === "dark";
  const medicFill = isDark ? "#FFFFFF" : "#0F172A";
  const gradId = `forestGrad_${mode}_${markOnly ? "mark" : "full"}`;
  const pineId = `pineGrad_${mode}_${markOnly ? "mark" : "full"}`;

  if (markOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 48" width="${width}" height="${height}" fill="none">
  <defs>
    <linearGradient id="${pineId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${isDark ? "#34D399" : "#10B981"}" />
      <stop offset="45%" stop-color="${isDark ? "#10B981" : "#059669"}" />
      <stop offset="100%" stop-color="${isDark ? "#059669" : "#047857"}" />
    </linearGradient>
  </defs>

  <g transform="translate(4, 3)">
    <path d="M18 3
             C18 3 13.5 10.5 10 14 C12 14.5 13.8 14.5 14.5 14.5
             C12 18.5 8 22 5.5 24.5 C7.8 25 10 25 11.5 25
             C8 29 4 33 2 34.5 C6.5 34.5 13.5 34.5 16 34.5
             L16 39.5 C16 40 16.5 40.5 17 40.5 L19 40.5 C19.5 40.5 20 40 20 39.5 L20 34.5
             C22.5 34.5 29.5 34.5 34 34.5
             C32 33 28 29 24.5 25 C26 25 28.2 25 30.5 24.5
             C28 22 24 18.5 21.5 14.5 C22.2 14.5 24 14.5 26 14
             C22.5 10.5 18 3 18 3 Z"
          fill="url(#${pineId})" />
    <path d="M18 3.5 L18 34.5" stroke="rgba(255,255,255,0.28)" stroke-width="0.8" stroke-linecap="round" />
  </g>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 48" width="${width}" height="${height}" fill="none">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${isDark ? "#34D399" : "#059669"}" />
      <stop offset="100%" stop-color="${isDark ? "#10B981" : "#047857"}" />
    </linearGradient>
    <linearGradient id="${pineId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${isDark ? "#34D399" : "#10B981"}" />
      <stop offset="45%" stop-color="${isDark ? "#10B981" : "#059669"}" />
      <stop offset="100%" stop-color="${isDark ? "#059669" : "#047857"}" />
    </linearGradient>
  </defs>

  <!-- Tree Icon -->
  <g transform="translate(6, 4)">
    <path d="M18 3
             C18 3 13.5 10.5 10 14 C12 14.5 13.8 14.5 14.5 14.5
             C12 18.5 8 22 5.5 24.5 C7.8 25 10 25 11.5 25
             C8 29 4 33 2 34.5 C6.5 34.5 13.5 34.5 16 34.5
             L16 39.5 C16 40 16.5 40.5 17 40.5 L19 40.5 C19.5 40.5 20 40 20 39.5 L20 34.5
             C22.5 34.5 29.5 34.5 34 34.5
             C32 33 28 29 24.5 25 C26 25 28.2 25 30.5 24.5
             C28 22 24 18.5 21.5 14.5 C22.2 14.5 24 14.5 26 14
             C22.5 10.5 18 3 18 3 Z"
          fill="url(#${pineId})" />
    <path d="M18 3.5 L18 34.5" stroke="rgba(255,255,255,0.28)" stroke-width="0.8" stroke-linecap="round" />
  </g>

  <!-- Wordmark lockup -->
  <text x="47" y="32" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24.5" letter-spacing="-0.035em">
    <tspan fill="${medicFill}" font-weight="600">Medic</tspan><tspan fill="url(#${gradId})" font-weight="800">Forest</tspan>
  </text>
</svg>`;
}

async function run() {
  const brandDir = path.resolve("public/brand");

  const darkFull = createSvg({ mode: "dark" });
  const lightFull = createSvg({ mode: "light" });
  const darkMark = createSvg({ mode: "dark", markOnly: true, width: 256, height: 256 });
  const lightMark = createSvg({ mode: "light", markOnly: true, width: 256, height: 256 });

  // Save SVGs
  await fs.writeFile(path.join(brandDir, "medicforest-logo-dark.svg"), darkFull);
  await fs.writeFile(path.join(brandDir, "medicforest-logo-light.svg"), lightFull);
  await fs.writeFile(path.join(brandDir, "medicforest-logo.svg"), darkFull);
  await fs.writeFile(path.join(brandDir, "medicforest-tree-mark.svg"), darkMark);

  // Save High-Res Transparent PNGs (840x192 retina)
  await sharp(Buffer.from(darkFull)).resize(840, 192).png().toFile(path.join(brandDir, "medicforest-logo-dark.png"));
  await sharp(Buffer.from(lightFull)).resize(840, 192).png().toFile(path.join(brandDir, "medicforest-logo.png"));
  await sharp(Buffer.from(darkMark)).resize(512, 512).png().toFile(path.join(brandDir, "medicforest-tree-mark.png"));

  console.log("All brand assets generated successfully");
}

run().catch(console.error);
