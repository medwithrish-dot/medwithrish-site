import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_PATH = "C:/Users/usedf/.gemini/antigravity/brain/b96a7c2f-6907-478e-a0f5-4a64b8bf1371/.user_uploaded/media_1790864008958.png";

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

  // 2. Full logo extraction (x = 45..990, y = 85..260)
  const cropX = 45;
  const cropY = 85;
  const cropW = 945;
  const cropH = 175;

  const lightLogoBuf = Buffer.alloc(cropW * cropH * 4);
  const darkLogoBuf = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcX = cropX + x;
      const srcY = cropY + y;
      const srcIdx = (srcY * info.width + srcX) * info.channels;
      const outIdx = (y * cropW + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      const minVal = Math.min(r, g, b);
      let alpha = 255;
      if (minVal >= 250) {
        alpha = 0;
      } else if (minVal >= 235) {
        alpha = Math.round(255 * (1 - (minVal - 235) / 15));
      }

      // Light logo: keep original colours on transparent canvas
      lightLogoBuf[outIdx] = r;
      lightLogoBuf[outIdx + 1] = g;
      lightLogoBuf[outIdx + 2] = b;
      lightLogoBuf[outIdx + 3] = alpha;

      // Dark logo: recolor dark green text ('Medic', x < 390) to crisp white
      if (alpha > 0) {
        if (x < 390 && r < 70 && g < 130 && b < 110) {
          darkLogoBuf[outIdx] = 255;
          darkLogoBuf[outIdx + 1] = 255;
          darkLogoBuf[outIdx + 2] = 255;
          darkLogoBuf[outIdx + 3] = alpha;
        } else {
          darkLogoBuf[outIdx] = r;
          darkLogoBuf[outIdx + 1] = g;
          darkLogoBuf[outIdx + 2] = b;
          darkLogoBuf[outIdx + 3] = alpha;
        }
      } else {
        darkLogoBuf[outIdx] = 0;
        darkLogoBuf[outIdx + 1] = 0;
        darkLogoBuf[outIdx + 2] = 0;
        darkLogoBuf[outIdx + 3] = 0;
      }
    }
  }

  // Save light & dark transparent logos (PNG)
  await sharp(lightLogoBuf, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile(path.join(brandDir, "medicforest-logo.png"));

  await sharp(darkLogoBuf, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile(path.join(brandDir, "medicforest-logo-dark.png"));

  // 3. Tree Mark extraction (x = 840..988, y = 88..258)
  const treeCropX = 840;
  const treeCropY = 88;
  const treeCropW = 148;
  const treeCropH = 170;

  const treeOutBuf = Buffer.alloc(treeCropW * treeCropH * 4);

  for (let y = 0; y < treeCropH; y++) {
    for (let x = 0; x < treeCropW; x++) {
      const srcX = treeCropX + x;
      const srcY = treeCropY + y;
      const srcIdx = (srcY * info.width + srcX) * info.channels;
      const outIdx = (y * treeCropW + x) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      const minVal = Math.min(r, g, b);
      if (minVal >= 250) {
        treeOutBuf[outIdx] = 0;
        treeOutBuf[outIdx + 1] = 0;
        treeOutBuf[outIdx + 2] = 0;
        treeOutBuf[outIdx + 3] = 0;
      } else if (minVal >= 235) {
        const alpha = Math.round(255 * (1 - (minVal - 235) / 15));
        treeOutBuf[outIdx] = r;
        treeOutBuf[outIdx + 1] = g;
        treeOutBuf[outIdx + 2] = b;
        treeOutBuf[outIdx + 3] = alpha;
      } else {
        treeOutBuf[outIdx] = r;
        treeOutBuf[outIdx + 1] = g;
        treeOutBuf[outIdx + 2] = b;
        treeOutBuf[outIdx + 3] = 255;
      }
    }
  }

  // Resize tree to fit centered on 512x512 canvas with comfortable ~15% padding
  const treePngBuffer = await sharp(treeOutBuf, {
    raw: { width: treeCropW, height: treeCropH, channels: 4 },
  })
    .png()
    .resize(360, 420, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const treeSquare512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: treePngBuffer, gravity: "center" }])
    .png()
    .toBuffer();

  // Save 512x512 tree marks
  await sharp(treeSquare512).toFile(path.join(brandDir, "medicforest-tree-mark.png"));
  await sharp(treeSquare512).toFile(path.join(appDir, "icon.png"));
  await sharp(treeSquare512).toFile(path.join(medicforestAppDir, "icon.png"));

  // Save 192x192 PWA / web manifest icon
  await sharp(treeSquare512)
    .resize(192, 192)
    .toFile(path.join(brandDir, "medicforest-tree-mark-192.png"));

  // Save 180x180 Apple touch icons
  const appleTouchIcon180 = await sharp(treeSquare512).resize(180, 180).toBuffer();
  await sharp(appleTouchIcon180).toFile(path.join(appDir, "apple-icon.png"));
  await sharp(appleTouchIcon180).toFile(path.join(medicforestAppDir, "apple-icon.png"));
  await sharp(appleTouchIcon180).toFile(path.join(publicDir, "apple-touch-icon.png"));

  // Save 32x32 and 16x16 PNGs
  const icon32 = await sharp(treeSquare512).resize(32, 32).toBuffer();
  const icon16 = await sharp(treeSquare512).resize(16, 16).toBuffer();
  const icon48 = await sharp(treeSquare512).resize(48, 48).toBuffer();

  await sharp(icon32).toFile(path.join(brandDir, "medicforest-tree-mark-32.png"));

  // Generate multi-resolution ICO file (16, 32, 48)
  const icoData = createIco([
    { buf: icon16, size: 16 },
    { buf: icon32, size: 32 },
    { buf: icon48, size: 48 },
  ]);

  await fs.writeFile(path.join(publicDir, "favicon.ico"), icoData);
  await fs.writeFile(path.join(appDir, "favicon.ico"), icoData);

  console.log("All MedicForest brand and favicon assets generated successfully!");
}

run().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
