/**
 * Optimiza los .glb para dispositivos móviles.
 *
 * El problema original: cada escultura traía 3-4 texturas 2048×2048
 * (~67 MB de VRAM por modelo). En un celular eso supera el presupuesto de
 * memoria del contexto WebGL y el navegador termina perdiendo el contexto
 * ("crash" del visor).
 *
 * Pipeline por archivo:
 *   1. albedo  → máx 1024×1024, WebP q90
 *   2. normal / metallicRoughness / occlusion → máx 512×512, WebP q85
 *   3. re-comprimir geometría con Draco (queda igual de fiel, sin simplify)
 *
 * Uso:  node .optimize-glb.cjs [archivo.glb ...]
 */
const fs = require("fs");
const path = require("path");
const { NodeIO } = require("@gltf-transform/core");
const {
  KHRDracoMeshCompression,
  EXTTextureWebP,
} = require("@gltf-transform/extensions");
const { textureCompress, draco } = require("@gltf-transform/functions");
const sharp = require("sharp");

const SRC = path.join(process.cwd(), "public", "models", "sculptures");
const BACKUP = path.join(
  process.env.TEMP || ".",
  "opencode",
  "glb-backup"
);
const OUT = path.join(process.env.TEMP || ".", "opencode", "glb-out");

const ALBEDO_SLOTS = /^baseColorTexture$/;
const DATA_SLOTS =
  /^(normalTexture|metallicRoughnessTexture|occlusionTexture|emissiveTexture)$/;

async function makeIO() {
  return new NodeIO()
    .registerExtensions([KHRDracoMeshCompression, EXTTextureWebP])
    .registerDependencies({
      "draco3d.decoder": await require("draco3dgltf").createDecoderModule(),
      "draco3d.encoder": await require("draco3dgltf").createEncoderModule(),
    });
}

function report(file) {
  const b = fs.readFileSync(file);
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jsonLen).toString("utf8"));
  const bin = b.subarray(20 + jsonLen + 8);
  let vram = 0;
  const res = [];
  for (const img of json.images || []) {
    const bv = json.bufferViews[img.bufferView];
    const raw = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const s = webpSize(raw);
    if (s) {
      vram += s.w * s.h * 4 * 1.333;
      res.push(`${s.w}x${s.h}`);
    }
  }
  let tris = 0;
  for (const m of json.meshes || []) {
    for (const p of m.primitives || []) {
      const idx = json.accessors[p.indices];
      if (idx) tris += idx.count / 3;
    }
  }
  return {
    vram: (vram / 1048576).toFixed(1),
    res: res.join("/"),
    tris: Math.round(tris),
    draco: (json.extensionsUsed || []).includes("KHR_draco_mesh_compression"),
  };
}

function webpSize(buf) {
  if (buf.length < 30) return null;
  const f = buf.toString("ascii", 12, 16);
  if (f === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (f === "VP8 ") {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  if (f === "VP8L") {
    if (buf[20] !== 0x2f) return null;
    const v = buf.readUInt32LE(21);
    return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 };
  }
  return null;
}

(async () => {
  fs.mkdirSync(BACKUP, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  const only = process.argv.slice(2);
  const files = (only.length ? only : fs.readdirSync(SRC)).filter((f) =>
    f.toLowerCase().endsWith(".glb")
  );

  let ok = 0;
  let failed = 0;
  for (const f of files) {
    const input = path.join(SRC, f);
    const output = path.join(OUT, f);
    const backup = path.join(BACKUP, f);
    const t0 = Date.now();
    try {
      if (!fs.existsSync(backup)) fs.copyFileSync(input, backup);

      const io = await makeIO();
      const doc = await io.read(input);

      await doc.transform(
        textureCompress({
          targetFormat: "webp",
          resize: [1024, 1024],
          quality: 90,
          encoder: sharp,
          slots: ALBEDO_SLOTS,
        })
      );
      await doc.transform(
        textureCompress({
          targetFormat: "webp",
          resize: [512, 512],
          quality: 85,
          encoder: sharp,
          slots: DATA_SLOTS,
        })
      );

      await doc.transform(draco());
      await io.write(output, doc);

      const inSize = fs.statSync(input).size;
      const outSize = fs.statSync(output).size;
      if (outSize >= inSize && only.length === 0) {
        console.log(`SKIP ${f}: no achica (${mb(inSize)} -> ${mb(outSize)} MB)`);
        failed += 1;
        continue;
      }

      fs.copyFileSync(output, input);
      const a = report(backup);
      const b = report(input);
      ok += 1;
      console.log(
        `OK   ${f}: ${mb(inSize)} -> ${mb(outSize)} MB | VRAM ${a.vram} -> ${b.vram} MB | ${a.res} -> ${b.res} | tris ${b.tris} | ${((Date.now() - t0) / 1000).toFixed(0)}s`
      );
    } catch (e) {
      failed += 1;
      console.log(`FAIL ${f}: ${e.message}`);
    }
  }
  console.log(`\nDONE ok=${ok} failed=${failed}`);
  console.log(`Backup de los originales: ${BACKUP}`);
})();

function mb(n) {
  return (n / 1048576).toFixed(2);
}
