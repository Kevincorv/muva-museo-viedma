/**
 * Renombra los .glb referenciados por src/data/sculptures.ts a rutas
 * URL-seguras (sin espacios ni caracteres fuera de ASCII), para que ninguna
 * descarga falle por codificación según el servidor/CDN.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(process.cwd(), "public", "models", "sculptures");

const MAP = {
  "sagrada familia 1.glb": "obra-01-sagrada-familia.glb",
  "foto ni\u00f1o jesus.glb": "obra-02-nino-jesus.glb",
  "virgen_maria_de_pie_imagen_clasica_de_la_virgen.glb": "obra-03-virgen-maria.glb",
  "virgen_de_pie.glb": "obra-04-virgen-de-pie.glb",
  "Santo_de_pie_sosteniendo_un_libro_abierto.glb": "obra-05-san-joaquin.glb",
  "San Miguel Arcangel.glb": "obra-06-san-miguel-arcangel.glb",
  "fray juan benardo.glb": "obra-07-fray-juan-bernardo.glb",
  "prueba.glb": "obra-08-francisco-y-domingo.glb",
  "Tup\u00e3sy Mar\u00eda.glb": "obra-10-tupasy-maria.glb",
  "Santo Padre Pio.glb": "obra-11-padre-pio.glb",
  "Fray Luis de Bola\u00f1os.glb": "obra-12-fray-luis-de-bolanos.glb",
  "nativa_arrodillada_rezando.glb": "obra-14-nativa-arrodillada.glb",
};

const existing = new Set(fs.readdirSync(DIR));
let ok = 0;
for (const [from, to] of Object.entries(MAP)) {
  if (!existing.has(from)) {
    console.log(`MISS ${from}`);
    continue;
  }
  if (existing.has(to)) {
    console.log(`SKIP destino ya existe: ${to}`);
    continue;
  }
  fs.renameSync(path.join(DIR, from), path.join(DIR, to));
  ok += 1;
  console.log(`${from}  ->  ${to}`);
}
console.log(`\nrenombrados: ${ok}/${Object.keys(MAP).length}`);
const targets = Object.values(MAP);
const allOk = targets.every(
  (f) => fs.existsSync(path.join(DIR, f)) && /^[\x21-\x7e]+$/.test(f)
);
console.log(`destinos ascii-safe: ${allOk ? "si" : "NO"}`);
