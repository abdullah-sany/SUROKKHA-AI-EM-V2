import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace: none

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

// Drawing function for Surokkha BD Icon
function drawIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background: Deep Navy
  let bgR = 15, bgG = 23, bgB = 42; // #0f172a

  const cx = 0.5, cy = 0.5;
  const dist = Math.hypot(nx - cx, ny - cy);

  // Cross dimensions
  const scale = isMaskable ? 0.75 : 0.85;
  const crossWidth = 0.14 * scale;
  const crossLength = 0.38 * scale;

  const inHorizontal = Math.abs(ny - cy) <= crossWidth && Math.abs(nx - cx) <= crossLength;
  const inVertical = Math.abs(nx - cx) <= crossWidth && Math.abs(ny - cy) <= crossLength;

  if (inHorizontal || inVertical) {
    // Red Cross: #dc2626
    // Check if line falls on lifeline
    const lx = (nx - cx) / scale;
    const ly = (ny - cy) / scale;

    // Lifeline coordinates between lx: -0.35 to 0.35
    let isLifeline = false;
    if (lx >= -0.35 && lx <= 0.35) {
      let expectedY = 0;
      if (lx >= -0.15 && lx < -0.07) {
        // peak up
        expectedY = -0.16 * ((lx - (-0.15)) / 0.08);
      } else if (lx >= -0.07 && lx < 0.05) {
        // drop down
        expectedY = -0.16 + 0.34 * ((lx - (-0.07)) / 0.12);
      } else if (lx >= 0.05 && lx < 0.14) {
        // recover
        expectedY = 0.18 - 0.28 * ((lx - 0.05) / 0.09);
      } else if (lx >= 0.14 && lx < 0.20) {
        // small peak
        expectedY = -0.10 + 0.10 * ((lx - 0.14) / 0.06);
      }

      if (Math.abs(ly - expectedY) <= 0.025) {
        isLifeline = true;
      }
    }

    if (isLifeline) {
      return [255, 255, 255, 255]; // White pulse line
    }
    return [220, 38, 38, 255]; // Medical Red
  }

  // Circular inner glow container
  if (dist <= (0.44 * scale)) {
    return [30, 41, 59, 255]; // Slate 800
  }

  return [bgR, bgG, bgB, 255];
}

// Generate files
const sizes = [
  { name: 'public/pwa-192x192.png', size: 192, maskable: false },
  { name: 'public/pwa-512x512.png', size: 512, maskable: false },
  { name: 'public/pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'public/apple-touch-icon.png', size: 180, maskable: false }
];

for (const { name, size, maskable } of sizes) {
  const buf = createPNG(size, size, (x, y, w, h) => drawIcon(x, y, w, h, maskable));
  fs.writeFileSync(name, buf);
  console.log(`Generated ${name} (${size}x${size})`);
}
