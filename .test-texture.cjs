const fs = require("fs");
const path = require("path");
const { NodeIO } = require("@gltf-transform/core");
const { KHRDracoMeshCompression, EXTTextureWebP } = require("@gltf-transform/extensions");
const { textureCompress, draco, dedup, prune } = require("@gltf-transform/functions");
const sharp = require("sharp");

const file = process.argv[2];
const out = process.argv[3];

(async () => {
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression, EXTTextureWebP])
    .registerDependencies({
      "draco3d.decoder": await require("draco3dgltf").createDecoderModule(),
      "draco3d.encoder": await require("draco3dgltf").createEncoderModule(),
    });

  const doc = await io.read(file);
  const before = fs.statSync(file).size;

  await doc.transform(
    textureCompress({ targetFormat: "webp", resize: [1024, 1024], slots: /baseColorTexture$/, quality: 85, encoder: sharp })
  );
  await doc.transform(
    textureCompress({
      targetFormat: "webp",
      resize: [512, 512],
      slots: /normalTexture$|metallicRoughnessTexture$|occlusionTexture$/,
      quality: 80,
      encoder: sharp,
    })
  );
  await doc.transform(draco());

  await io.write(out, doc);
  const after = fs.statSync(out).size;
  console.log(`${path.basename(file)}: ${(before / 1048576).toFixed(2)}MB -> ${(after / 1048576).toFixed(2)}MB`);
})().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});
