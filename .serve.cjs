const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = 8099;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".glb": "model/gltf-binary",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".css": "text/css",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        console.log(new Date().toISOString()+" "+req.method+" "+url+" -> 404"); res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      });
      console.log(new Date().toISOString()+" "+req.method+" "+url+" -> 200 ("+data.length+")"); res.end(data);
    });
  })
  .listen(port, () => console.log("serving " + root + " on " + port));

