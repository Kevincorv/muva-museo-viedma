const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function decodePNG(buf) {
  // buf: PNG file bytes
  let pos = 8;
  let w, h, bitDepth, colorType;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) return null;
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) return null;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(stride * h);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const line = raw.subarray(p, p + stride);
    p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= channels ? prev[i - channels] : 0;
      const x = line[i];
      let v;
      switch (filter) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: {
          const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
          v = x + pr; break;
        }
        default: v = x;
      }
      cur[i] = v & 255;
    }
  }
  return { w, h, channels, data: out };
}

function avgChannels(img, pick) {
  const { w, h, channels, data } = img;
  const sums = new Array(channels).fill(0);
  const n = w * h;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < channels; c++) sums[c] += data[i * channels + c];
  }
  return sums.map((s) => Math.round((s / n) * 100) / 100);
}

const dir = path.join(process.cwd(), "public", "models", "sculptures");
for (const f of ["sagrada familia 1.glb", "foto ni", "Santo_de_pie_sosteniendo_un_libro_abierto.glb", "prueba.glb", "virgen_de_pie.glb", "angel_de_rodillas.glb"]) {
  const full = fs.readdirSync(dir).find((n) => n.startsWith(f.slice(0, 12)) && n.endsWith(".glb"));
  if (!full) continue;
  const b = fs.readFileSync(path.join(dir, full));
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jsonLen).toString("utf8"));
  const bin = b.subarray(20 + jsonLen + 8);
  const m = json.materials[0].pbrMetallicRoughness;
  const labels = { baseColorTexture: "albedo", metallicRoughnessTexture: "metalRough", normalTexture: "normal" };
  console.log(`\n=== ${full}`);
  for (const key of Object.keys(labels)) {
    if (!m[key]) continue;
    const tex = json.textures[m[key].index];
    const img = json.images[tex.source];
    if (!/png/i.test(img.mimeType)) { console.log(`  ${labels[key]}: ${img.mimeType}`); continue; }
    const start = json.bufferViews[img.bufferView].byteOffset || 0;
    const len = json.bufferViews[img.bufferView].byteLength;
    const png = decodePNG(bin.subarray(start, start + len));
    if (!png) { console.log(`  ${labels[key]}: no decodable`); continue; }
    const avg = avgChannels(png);
    console.log(`  ${labels[key]}: ${png.w}x${png.h} ch=${png.channels} avg=[${avg.map(x=>x.toFixed(1)).join(", ")}]`);
  }
}
