const fs = require("fs");
const path = require("path");

function pngSize(buf) {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

const dir = path.join(process.cwd(), "public", "models", "sculptures");
const rows = [];
for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".glb"))) {
  const b = fs.readFileSync(path.join(dir, name));
  const jsonLen = b.readUInt32LE(12);
  let json;
  try { json = JSON.parse(b.subarray(20, 20 + jsonLen).toString("utf8")); }
  catch (e) { console.log(`${name}: JSON PARSE FAIL`); continue; }
  const binLen = b.readUInt32LE(20 + jsonLen);
  const bin = b.subarray(20 + jsonLen + 8, 20 + jsonLen + 8 + binLen);

  let tris = 0, verts = 0, meshes = 0;
  for (const acc of json.accessors || []) {
    if (acc.type === "SCALAR" && acc.componentType === 5125) { /* count only */ }
  }
  for (const m of json.meshes || []) {
    meshes++;
    for (const p of m.primitives || []) {
      const idx = json.accessors[p.indices];
      if (idx) tris += idx.count / 3;
      const pos = json.accessors[p.attributes.POSITION];
      if (pos) verts += pos.count;
    }
  }

  const texInfo = [];
  let texMem = 0;
  for (const img of json.images || []) {
    const bv = json.bufferViews[img.bufferView];
    const start = bv.byteOffset || 0;
    const len = bv.byteLength;
    const raw = bin.subarray(start, start + len);
    let size = null;
    if (/png/i.test(img.mimeType || "")) size = pngSize(raw);
    else if (/jpeg|jpg/i.test(img.mimeType || "")) size = jpegSize(raw);
    const mime = (img.mimeType || "?").replace("image/", "");
    if (size) {
      const mem = size.w * size.h * 4 * 1.33;
      texMem += mem;
      texInfo.push(`${size.w}x${size.h}.${mime}(${(len / 1024).toFixed(0)}k)`);
    } else {
      texInfo.push(`?.${mime}(${(len / 1024).toFixed(0)}k)`);
    }
  }

  const ext = (json.extensionsUsed || []).join(",");
  rows.push({
    name,
    mb: (b.length / 1048576).toFixed(2),
    tris: Math.round(tris),
    verts,
    meshes,
    mats: (json.materials || []).length,
    texMemMB: (texMem / 1048576).toFixed(1),
    tex: texInfo.join(" | "),
    ext,
  });
}
rows.sort((a, x) => x.tris - a.tris);
console.log("name | MB | tris | verts | meshes | mats | texMem(MB) | ext");
for (const r of rows) {
  console.log(`${r.name} | ${r.mb} | ${r.tris} | ${r.verts} | ${r.meshes} | ${r.mats} | ${r.texMemMB} | ${r.ext}`);
  console.log(`    ${r.tex}`);
}
