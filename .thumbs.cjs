const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(process.cwd(), "public", "models", "sculptures");
const OUT = path.join(process.cwd(), "public", "images", "sculptures");
fs.mkdirSync(OUT, { recursive: true });

// obra-XX -> model file (must match src/data/sculptures.ts)
const MAP = {
  "obra-01": "sagrada familia 1.glb",
  "obra-02": "foto niño jesus.glb",
  "obra-03": "virgen_maria_de_pie_imagen_clasica_de_la_virgen.glb",
  "obra-04": "SANTA ANA.glb",
  "obra-05": "Santo_de_pie_sosteniendo_un_libro_abierto.glb",
  "obra-06": "obra-06-san-miguel-arcangel_nuevo.glb",
  "obra-07": "fray juan benardo.glb",
  "obra-08": "prueba.glb",
  "obra-10": "Tupãsy María.glb",
  "obra-11": "Santo Padre Pio.glb",
  "obra-12": "Fray Luis de Bolaños.glb",
  "obra-13": "La Pasionaria y San Ignacio.glb",
  "obra-14": "nativa_arrodillada_rezando.glb",
};

async function extract(obra, modelFile) {
  const input = path.join(SRC, modelFile);
  if (!fs.existsSync(input)) {
    console.log(`SKIP ${obra}: model missing (${modelFile})`);
    return;
  }
  const b = fs.readFileSync(input);
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jsonLen).toString("utf8"));
  const mat = json.materials && json.materials[0];
  const bt = mat && mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorTexture;
  if (!bt) {
    console.log(`SKIP ${obra}: no baseColorTexture`);
    return;
  }
  const tex = json.textures[bt.index];
  const src =
    tex.source != null
      ? tex.source
      : tex.extensions &&
        tex.extensions.EXT_texture_webp &&
        tex.extensions.EXT_texture_webp.source;
  if (src == null) {
    console.log(`SKIP ${obra}: cannot resolve texture source`);
    return;
  }
  const img = json.images[src];
  if (img.bufferView == null) {
    console.log(`SKIP ${obra}: image is uri-based`);
    return;
  }
  const bv = json.bufferViews[img.bufferView];
  const start = 20 + jsonLen + 8 + (bv.byteOffset || 0);
  const bytes = b.subarray(start, start + bv.byteLength);
  const outFile = path.join(OUT, `${obra}.webp`);
  await sharp(bytes)
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(outFile);
  const size = fs.statSync(outFile).size;
  const meta = await sharp(outFile).metadata();
  console.log(`OK   ${obra}: ${img.mimeType} -> ${meta.width}x${meta.height} webp ${(size / 1024).toFixed(0)}KB`);
}

(async () => {
  const only = process.argv.slice(2);
  const keys = only.length ? only : Object.keys(MAP);
  for (const obra of keys) {
    try {
      await extract(obra, MAP[obra]);
    } catch (e) {
      console.log(`FAIL ${obra}: ${e.message}`);
    }
  }
})();
