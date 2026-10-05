const fs = require("fs");
const path = require("path");

const src = fs.readFileSync("src/data/sculptures.ts", "utf8");
const paths = [...src.matchAll(/model:\s*"([^"]*)"/g)].map((m) => m[1]);
let bad = 0;
for (const p of paths) {
  if (!p) {
    console.log("(sin modelo) obra-13");
    continue;
  }
  const file = path.join(process.cwd(), "public", p.replace(/^\//, ""));
  const ok = fs.existsSync(file);
  if (!ok) bad++;
  console.log((ok ? "OK   " : "FALTA ") + p);
}
console.log(bad ? `FALTAN ${bad}` : "TODAS LAS RUTAS EXISTEN");

console.log("\n--- miniaturas ---");
const thumbs = [...src.matchAll(/thumbnail:\s*"([^"]*)"/g)].map((m) => m[1]);
let missing = 0;
for (const t of thumbs) {
  const file = path.join(process.cwd(), "public", t.replace(/^\//, ""));
  const ok = fs.existsSync(file);
  if (!ok) missing++;
  console.log(
    (ok ? "OK   " : "FALTA ") +
      t +
      (ok ? ` (${(fs.statSync(file).size / 1024).toFixed(0)}KB)` : "")
  );
}
console.log(missing ? `FALTAN ${missing} MINIATURAS` : "MINIATURAS OK");
