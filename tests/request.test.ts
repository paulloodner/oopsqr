import { test } from "node:test";
import assert from "node:assert/strict";

import {
  clientIp,
  extensionFor,
  hasSameOrigin,
  hasValidImageMagic,
} from "../src/lib/request";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

test("hasValidImageMagic : vérifie la signature réelle du fichier", () => {
  assert.equal(hasValidImageMagic(PNG, "image/png"), true);
  assert.equal(hasValidImageMagic(Buffer.from("not an image"), "image/png"), false);
  assert.equal(hasValidImageMagic(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1]), "image/jpeg"), true);
  assert.equal(hasValidImageMagic(Buffer.from("RIFF1234WEBP00"), "image/webp"), true);
  assert.equal(hasValidImageMagic(Buffer.from("RIFF1234WAVE00"), "image/webp"), false);
  assert.equal(hasValidImageMagic(PNG, "image/jpeg"), false);
});

test("extensionFor : mime -> extension", () => {
  assert.equal(extensionFor("image/webp"), "webp");
  assert.equal(extensionFor("image/jpeg"), "jpg");
  assert.equal(extensionFor("image/png"), "png");
});

test("clientIp : première IP de x-forwarded-for, sinon x-real-ip", () => {
  const req = new Request("https://x.test", {
    headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
  });
  assert.equal(clientIp(req), "203.0.113.5");
  const req2 = new Request("https://x.test", { headers: { "x-real-ip": "198.51.100.9" } });
  assert.equal(clientIp(req2), "198.51.100.9");
});

test("hasSameOrigin : accepte les clients sans Origin, refuse une origine tierce", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://oopsqr.onrender.com";
  assert.equal(hasSameOrigin(new Request("https://oopsqr.onrender.com/api/x", { method: "POST" })), true);
  assert.equal(
    hasSameOrigin(
      new Request("https://oopsqr.onrender.com/api/x", {
        method: "POST",
        headers: { origin: "https://oopsqr.onrender.com" },
      })
    ),
    true
  );
  assert.equal(
    hasSameOrigin(
      new Request("https://oopsqr.onrender.com/api/x", {
        method: "POST",
        headers: { origin: "https://evil.example.com" },
      })
    ),
    false
  );
});
