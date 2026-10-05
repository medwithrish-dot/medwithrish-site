import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const brandDir = path.resolve("public/brand");

  const markPath = path.join(brandDir, "medicforest-mark.png");
  const fullLogoPath = path.join(brandDir, "medicforest-logo.png");

  // 1. Prepare stethoscope mark for 512x512 canvas
  const markBuf = await sharp(markPath)
    .resize(340, 340, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const markTop = 38;
  const markLeft = Math.round((512 - 340) / 2); // 86

  // SVG Text Overlay 1: Plain "MedWithRish" bottom-left (bold, high-clarity)
  const svgMedWithRish = (fillColor) => Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <text
        x="36"
        y="472"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif"
        font-size="32"
        font-weight="800"
        letter-spacing="-0.03em"
        fill="${fillColor}"
      >MedWithRish</text>
    </svg>
  `);

  // SVG Text Overlay 2: "BY MedWithRish"
  const svgByMedWithRish = (fillColor, subColor) => Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <text
        x="36"
        y="450"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif"
        font-size="12"
        font-weight="800"
        letter-spacing="0.12em"
        text-transform="uppercase"
        fill="${subColor}"
      >BY</text>
      <text
        x="36"
        y="476"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif"
        font-size="28"
        font-weight="800"
        letter-spacing="-0.03em"
        fill="${fillColor}"
      >MedWithRish</text>
    </svg>
  `);

  // --- OUTPUT 1: White background, Stethoscope Mark, "MedWithRish" bottom-left ---
  const img1 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: markBuf, top: markTop, left: markLeft },
      { input: svgMedWithRish("#043f36"), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(brandDir, "stripe-checkout-medwithrish-white.png"), img1);

  // --- OUTPUT 2: Transparent background, Stethoscope Mark, "MedWithRish" bottom-left ---
  const img2 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: markBuf, top: markTop, left: markLeft },
      { input: svgMedWithRish("#043f36"), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(brandDir, "stripe-checkout-medwithrish-transparent.png"), img2);

  // --- OUTPUT 3: White background, Stethoscope Mark, "BY MedWithRish" bottom-left ---
  const img3 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: markBuf, top: markTop - 6, left: markLeft },
      { input: svgByMedWithRish("#043f36", "#059669"), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(brandDir, "stripe-checkout-by-medwithrish-white.png"), img3);

  // --- OUTPUT 4: Full MedicForest Logo + "MedWithRish" bottom-left (512x512 White) ---
  const fullLogoBuf = await sharp(fullLogoPath)
    .resize(440, 100, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const fullLogoMeta = await sharp(fullLogoBuf).metadata();
  const fullLogoLeft = Math.round((512 - fullLogoMeta.width) / 2);
  const fullLogoTop = Math.round((512 - fullLogoMeta.height) / 2) - 30;

  const img4 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: fullLogoBuf, top: fullLogoTop, left: fullLogoLeft },
      { input: svgMedWithRish("#043f36"), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(brandDir, "stripe-checkout-medicforest-medwithrish-white.png"), img4);

  // --- OUTPUT 5: Wide Header Banner (929x260) with "MedWithRish" bottom-left ---
  const bannerW = 929;
  const bannerH = 260;
  const svgBannerText = Buffer.from(`
    <svg width="${bannerW}" height="${bannerH}" viewBox="0 0 ${bannerW} ${bannerH}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="24"
        y="${bannerH - 18}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif"
        font-size="22"
        font-weight="800"
        letter-spacing="-0.03em"
        fill="#043f36"
      >MedWithRish</text>
    </svg>
  `);

  const fullOriginalLogo = await sharp(fullLogoPath).toBuffer();
  const img5 = await sharp({
    create: {
      width: bannerW,
      height: bannerH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      { input: fullOriginalLogo, top: 10, left: 0 },
      { input: svgBannerText, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(brandDir, "stripe-branding-logo-medwithrish.png"), img5);

  console.log("Successfully generated all assets with updated sizing!");
}

main().catch(console.error);
