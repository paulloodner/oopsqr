import { test } from "node:test";
import assert from "node:assert/strict";

import { buildQrSvg, createQrMatrix } from "../src/lib/qr-render";

const base = {
  fg: "#17151F",
  bg: "#F7F5F0",
  dotStyle: "square" as const,
  cornerStyle: "square" as const,
};

test("createQrMatrix : matrice carrée avec un niveau de correction", () => {
  const matrix = createQrMatrix("https://oopsqr.onrender.com/s/test");
  assert.ok(matrix);
  assert.ok(matrix.size > 20);
  assert.equal(matrix.data.length, matrix.size * matrix.size);
  assert.ok(["L", "M", "Q", "H"].includes(matrix.level));
});

test("buildQrSvg : produit un SVG exploitable avec les couleurs demandées", () => {
  const qr = buildQrSvg({ ...base, data: "https://oopsqr.onrender.com/s/test" });
  assert.ok(qr);
  assert.ok(qr.svg.includes("<svg"));
  assert.ok(qr.svg.includes("viewBox"));
  assert.ok(qr.svg.toLowerCase().includes("#17151f"));
});

test("buildQrSvg : contenu vide ou trop long -> null", () => {
  assert.equal(buildQrSvg({ ...base, data: "" }), null);
  assert.equal(buildQrSvg({ ...base, data: "x".repeat(4000) }), null);
});
