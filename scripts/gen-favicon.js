/**
 * Generates public/favicon.ico matching the DevHub logo
 * (green rounded square + >_ terminal icon)
 * Uses only Node.js built-ins: zlib + fs
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const W = 32, H = 32;
const BG    = [11, 14, 26, 255];   // #0B0E1A
const GREEN = [59, 214, 113, 255]; // #3BD671

// Pixel buffer: array of rows, each row is Uint8Array of RGBA
const rows = Array.from({ length: H }, () => new Uint8Array(W * 4));

function set(x, y, [r, g, b, a]) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = x * 4;
  rows[y][i] = r; rows[y][i+1] = g; rows[y][i+2] = b; rows[y][i+3] = a;
}

// ---------- 1. Fill background ----------
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    set(x, y, BG);

// ---------- 2. Green rounded rect (2,2)→(29,29), radius 5 ----------
function inRRect(x, y) {
  const [x1,y1,x2,y2,r] = [2,2,29,29,5];
  if (x < x1 || x > x2 || y < y1 || y > y2) return false;
  const cx = x + 0.5, cy = y + 0.5;
  if (cx < x1+r && cy < y1+r) return Math.hypot(cx-(x1+r), cy-(y1+r)) <= r;
  if (cx > x2-r && cy < y1+r) return Math.hypot(cx-(x2-r), cy-(y1+r)) <= r;
  if (cx < x1+r && cy > y2-r) return Math.hypot(cx-(x1+r), cy-(y2-r)) <= r;
  if (cx > x2-r && cy > y2-r) return Math.hypot(cx-(x2-r), cy-(y2-r)) <= r;
  return true;
}
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (inRRect(x, y)) set(x, y, GREEN);

// ---------- 3. Draw ">" chevron in dark (2px thick arms) ----------
// Upper arm: (8,9)→(14,15), Lower arm: (14,15)→(8,21)
for (let i = 0; i <= 6; i++) {
  set(8+i,   9+i,  BG); // upper arm
  set(9+i,   9+i,  BG); // thickness
  set(8+i,  21-i,  BG); // lower arm
  set(9+i,  21-i,  BG); // thickness
}

// ---------- 4. Draw "_" underscore (x 18..25, y 21..22) ----------
for (let x = 18; x <= 25; x++) {
  set(x, 21, BG);
  set(x, 22, BG);
}

// ============================================================
// PNG encoder (pure Node.js)
// ============================================================
function makeCRCTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
}
const CRC_TABLE = makeCRCTable();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcSrc = Buffer.concat([t, data]);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcSrc));
  return Buffer.concat([len, t, data, crcBuf]);
}

// Build raw scanlines (filter byte 0 + RGBA row)
const scanlines = Buffer.concat(
  rows.map(row => Buffer.concat([Buffer.from([0]), Buffer.from(row)]))
);
const compressed = zlib.deflateSync(scanlines, { level: 9 });

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(W, 0); ihdrData.writeUInt32BE(H, 4);
ihdrData[8] = 8; ihdrData[9] = 6; // RGBA

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  pngChunk("IHDR", ihdrData),
  pngChunk("IDAT", compressed),
  pngChunk("IEND", Buffer.alloc(0)),
]);

// ============================================================
// ICO wrapper (embeds PNG)
// ============================================================
const ico = Buffer.alloc(6 + 16 + png.length);
ico.writeUInt16LE(0, 0);           // Reserved
ico.writeUInt16LE(1, 2);           // Type: 1 = ICO
ico.writeUInt16LE(1, 4);           // Count: 1 image
ico.writeUInt8(32, 6);             // Width
ico.writeUInt8(32, 7);             // Height
ico.writeUInt8(0, 8);              // ColorCount
ico.writeUInt8(0, 9);              // Reserved
ico.writeUInt16LE(1, 10);          // Planes
ico.writeUInt16LE(32, 12);         // BitCount
ico.writeUInt32LE(png.length, 14); // BytesInRes
ico.writeUInt32LE(22, 18);         // ImageOffset (6+16)
png.copy(ico, 22);

const outPath = path.join(__dirname, "../public/favicon.ico");
fs.writeFileSync(outPath, ico);
console.log(`✅ favicon.ico written to ${outPath} (${ico.length} bytes)`);
