const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const sharp = require("sharp");

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const PROFILE = path.join(
  process.env.TEMP,
  "muva-chrome-profile"
);
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "sculptures");
const PAGE = "http://localhost:8099/.bright-test.html?m=";

const MODELS = {
  "obra-01": "sagrada familia 1.glb",
  "obra-02": "foto nino jesus.glb",
  "obra-03": "virgen_maria_de_pie_imagen_clasica_de_la_virgen.glb",
  "obra-04": "SANTA ANA.glb",
  "obra-05": "Santo_de_pie_sosteniendo_un_libro_abierto.glb",
  "obra-06": "obra-06-san-miguel-arcangel_nuevo.glb",
  "obra-07": "fray juan benardo.glb",
  "obra-08": "prueba.glb",
  "obra-10": "Tupasy Maria.glb",
  "obra-11": "Santo Padre Pio.glb",
  "obra-12": "Fray Luis de Bolanos.glb",
  "obra-13": "La Pasionaria y San Ignacio.glb",
  "obra-14": "nativa_arrodillada_rezando.glb",
};
// nombres reales con tildes/ñ (el mapa de arriba es solo para depurar)
const REAL = {
  "obra-02": "foto niño jesus.glb",
  "obra-10": "Tupãsy María.glb",
  "obra-12": "Fray Luis de Bolaños.glb",
};

function get(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(url + " -> " + data.slice(0, 200)));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForChrome() {
  for (let i = 0; i < 60; i++) {
    try {
      return await get(`http://localhost:${PORT}/json/version`);
    } catch {
      await sleep(500);
    }
  }
  throw new Error("chrome no arrancó");
}

async function withPage(url, timeoutMs) {
  const target = await get(
    `http://localhost:${PORT}/json/new?${encodeURIComponent("about:blank")}`,
    "PUT"
  );
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let id = 0;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  };

  try {
    await send("Page.enable");
    await send("Page.navigate", { url });
    const deadline = Date.now() + timeoutMs;
    let title = "";
    while (Date.now() < deadline) {
      await sleep(400);
      try {
        const r = await send("Runtime.evaluate", {
          expression: "document.title",
          returnByValue: true,
        });
        title = (r.result && r.result.value) || "";
      } catch {
        continue;
      }
      if (/^(READY|ERROR|ERR:|REJ:|PARSED)/.test(title)) break;
    }
    await sleep(600); // deja renderizar un frame extra
    const shot = await send("Page.captureScreenshot", { format: "png" });
    return { title, png: Buffer.from(shot.data, "base64") };
  } finally {
    try {
      await get(
        `http://localhost:${PORT}/json/close/${target.id}`
      ).catch(() => {});
    } catch {}
    ws.close();
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const keys = only.length ? only : Object.keys(MODELS);

  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${PROFILE}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--enable-unsafe-swiftshader",
      "--window-size=720,720",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true }
  );

  let ok = 0,
    fail = 0;
  try {
    await waitForChrome();
    console.log("chrome ok");
    for (const obra of keys) {
      const file = REAL[obra] || MODELS[obra];
      if (!file) {
        console.log(`SKIP ${obra}: sin modelo`);
        continue;
      }
      const url =
        PAGE + encodeURIComponent("/public/models/sculptures/" + file);
      try {
        const { title, png } = await withPage(url, 40000);
        if (!title.startsWith("READY")) {
          console.log(`FAIL ${obra} (${file}): title=${title}`);
          fs.writeFileSync(
            path.join(ROOT, `.fail-${obra}.png`),
            png
          );
          fail++;
          continue;
        }
        const outFile = path.join(OUT_DIR, `${obra}.webp`);
        await sharp(png).webp({ quality: 82 }).toFile(outFile);
        const size = fs.statSync(outFile).size;
        console.log(
          `OK   ${obra}: ${title} ${(size / 1024).toFixed(0)}KB`
        );
        ok++;
      } catch (e) {
        console.log(`FAIL ${obra}: ${e.message}`);
        fail++;
      }
    }
  } finally {
    chrome.kill();
  }
  console.log(`DONE ok=${ok} fail=${fail}`);
  process.exit(fail ? 1 : 0);
})();
