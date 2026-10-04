import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_PATH = "C:/Users/usedf/.gemini/antigravity/brain/b96a7c2f-6907-478e-a0f5-4a64b8bf1371/.user_uploaded/media_1790868249810.png";

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type (1 = icon)
  header.writeUInt16LE(images.length, 4); // image count

  let offset = 6 + images.length * 16;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buf.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // image offset
    entries.push(entry);
    offset += img.buf.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

async function run() {
  const brandDir = path.resolve("public/brand");
  const publicDir = path.resolve("public");
  const appDir = path.resolve("app");
  const medicforestAppDir = path.resolve("app/medicforest");

  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(medicforestAppDir, { recursive: true });

  // 1. Copy pristine source to public/brand/medicforest-source-logo.png
  await fs.copyFile(SOURCE_PATH, path.join(brandDir, "medicforest-source-logo.png"));

  const img = sharp(SOURCE_PATH);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // 2. Full logo extraction (x = 52..980, y = 72..281)
  const cropX = 52;
  const cropY = 72;
  const cropW = 929;
  const cropH = 210;

  const lightLogoBuf = Buffer.alloc(cropW * cropH * 4);
  const darkLogoBuf = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcX = cropX + x;
      const srcY = cropY + y;
      const srcIdx = (srcY * info.width + srcX) * 4;
      const outIdx = (y * cropW + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const a = data[srcIdx + 3];

      if (a < 10) {
        lightLogoBuf[outIdx + 3] = 0;
        darkLogoBuf[outIdx + 3] = 0;
        continue;
      }

      // Light logo: keep pristine original colours and transparency
      lightLogoBuf[outIdx] = r;
      lightLogoBuf[outIdx + 1] = g;
      lightLogoBuf[outIdx + 2] = b;
      lightLogoBuf[outIdx + 3] = a;

      // Dark logo: recolor dark green parts (#043f36, r < 40, g < 100, b < 85) to pure white (#FFFFFF)
      // Bright teal and mint parts (earpieces, inner bell circle, 'Forest' text) have g > 140 && b > 100
      const isBrightTeal = g > 140 && b > 100;
      if (!isBrightTeal) {
        darkLogoBuf[outIdx] = 255;
        darkLogoBuf[outIdx + 1] = 255;
        darkLogoBuf[outIdx + 2] = 255;
        darkLogoBuf[outIdx + 3] = a;
      } else {
        darkLogoBuf[outIdx] = r;
        darkLogoBuf[outIdx + 1] = g;
        darkLogoBuf[outIdx + 2] = b;
        darkLogoBuf[outIdx + 3] = a;
      }
    }
  }

  // Save light and dark full logos
  const lightLogoPng = await sharp(lightLogoBuf, { raw: { width: cropW, height: cropH, channels: 4 } }).png().toBuffer();
  const darkLogoPng = await sharp(darkLogoBuf, { raw: { width: cropW, height: cropH, channels: 4 } }).png().toBuffer();

  await fs.writeFile(path.join(brandDir, "medicforest-logo.png"), lightLogoPng);
  await fs.writeFile(path.join(brandDir, "medicforest-logo-dark.png"), darkLogoPng);

  // 3. Stethoscope 'M' Mark extraction:
  // Component bounds: x = 52..254 (w = 203), y = 72..281 (h = 210)
  // Exclude 'e' pixels at x >= 247 that lie outside bell radius (dist > 36)
  const markW = 203;
  const markH = 210;
  const markBuf = Buffer.alloc(markW * markH * 4);

  for (let y = 0; y < markH; y++) {
    for (let x = 0; x < markW; x++) {
      const srcX = 52 + x;
      const srcY = 72 + y;
      const srcIdx = (srcY * info.width + srcX) * 4;
      const outIdx = (y * markW + x) * 4;

      const a = data[srcIdx + 3];
      if (a < 10) continue;

      // Bell center is (219, 247) with radius ~35.
      // The letter 'e' only exists at srcY >= 170 to the right of the stethoscope bell (srcX >= 246).
      const distFromBell = Math.sqrt((srcX - 219) ** 2 + (srcY - 247) ** 2);
      if (srcY >= 170 && srcX >= 246 && distFromBell > 35.5) {
        continue; // skip 'e' pixel
      }

      markBuf[outIdx] = data[srcIdx];
      markBuf[outIdx + 1] = data[srcIdx + 1];
      markBuf[outIdx + 2] = data[srcIdx + 2];
      markBuf[outIdx + 3] = a;
    }
  }

  // Center mark inside 512x512 canvas with ~15% padding (380x393 mark inside 512x512)
  const rawMarkImg = sharp(markBuf, { raw: { width: markW, height: markH, channels: 4 } });
  const mark512 = await rawMarkImg
    .resize(380, 393, { fit: "contain" })
    .extend({
      top: 59,
      bottom: 60,
      left: 66,
      right: 66,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Save tree mark and standalone mark aliases
  await fs.writeFile(path.join(brandDir, "medicforest-tree-mark.png"), mark512);
  await fs.writeFile(path.join(brandDir, "medicforest-mark.png"), mark512);

  // 4. Generate Responsive Icons
  const mark192 = await sharp(mark512).resize(192, 192).png().toBuffer();
  const mark180 = await sharp(mark512).resize(180, 180).png().toBuffer();
  const mark48 = await sharp(mark512).resize(48, 48).png().toBuffer();
  const mark32 = await sharp(mark512).resize(32, 32).png().toBuffer();
  const mark16 = await sharp(mark512).resize(16, 16).png().toBuffer();

  await fs.writeFile(path.join(brandDir, "medicforest-tree-mark-192.png"), mark192);
  await fs.writeFile(path.join(brandDir, "medicforest-tree-mark-32.png"), mark32);

  // 5. Save Favicons (.ico multi-resolution)
  const icoBuf = createIco([
    { size: 16, buf: mark16 },
    { size: 32, buf: mark32 },
    { size: 48, buf: mark48 },
  ]);

  await fs.writeFile(path.join(publicDir, "favicon.ico"), icoBuf);
  await fs.writeFile(path.join(appDir, "favicon.ico"), icoBuf);

  // 6. Save Next.js App Icons
  await fs.writeFile(path.join(appDir, "icon.png"), mark512);
  await fs.writeFile(path.join(medicforestAppDir, "icon.png"), mark512);

  // 7. Save Apple Touch Icons
  await fs.writeFile(path.join(publicDir, "apple-touch-icon.png"), mark180);
  await fs.writeFile(path.join(appDir, "apple-icon.png"), mark180);
  await fs.writeFile(path.join(medicforestAppDir, "apple-icon.png"), mark180);

  console.log("Successfully generated all MedicForest brand assets, favicons, and icons.");
}

run().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
