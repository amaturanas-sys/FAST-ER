// Genera los iconos PNG de la PWA sin dependencias externas.
// Diseno: fondo teal con una cruz medica blanca. Una variante "maskable"
// con mayor margen de seguridad para Android.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const TEAL = [32, 128, 150];   // #208096
const WHITE = [255, 255, 255];

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// crossInset: fraccion del lado usada como margen alrededor de la cruz (mas grande = cruz mas chica, para maskable)
function makePng(size, crossInset) {
  const px = Buffer.alloc(size * size * 4);
  const r = Math.round(size * 0.14); // radio de esquinas redondeadas
  // grosor del brazo de la cruz y su extension
  const inset = Math.round(size * crossInset);
  const armHalf = Math.round(size * 0.11);
  const c = size / 2;

  const inRounded = (x, y) => {
    // dentro de rectangulo con esquinas redondeadas
    const minX = r, maxX = size - r, minY = r, maxY = size - r;
    if (x >= minX && x <= maxX) return y >= 0 && y < size;
    if (y >= minY && y <= maxY) return x >= 0 && x < size;
    const cx = x < minX ? minX : maxX;
    const cy = y < minY ? minY : maxY;
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  };

  const inCross = (x, y) => {
    const within = (v) => v >= inset && v <= size - inset;
    const vBar = Math.abs(x - c) <= armHalf && within(y);
    const hBar = Math.abs(y - c) <= armHalf && within(x);
    return vBar || hBar;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (!inRounded(x, y)) {
        px[i + 3] = 0; // transparente fuera del cuadro redondeado
        continue;
      }
      const col = inCross(x + 0.5, y + 0.5) ? WHITE : TEAL;
      px[i] = col[0];
      px[i + 1] = col[1];
      px[i + 2] = col[2];
      px[i + 3] = 255;
    }
  }

  // filtrado PNG (filtro 0 por scanline)
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ['icon-192.png', 192, 0.30],
  ['icon-512.png', 512, 0.30],
  ['icon-maskable-512.png', 512, 0.38], // mas margen para la zona segura
  ['apple-touch-icon.png', 180, 0.30],
];

for (const [name, size, inset] of targets) {
  fs.writeFileSync(path.join(outDir, name), makePng(size, inset));
  console.log('wrote', name, size + 'x' + size);
}
