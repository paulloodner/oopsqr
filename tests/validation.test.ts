import { test } from "node:test";
import assert from "node:assert/strict";

import {
  formatBytes,
  randomId,
  safeColor,
  sanitizeLine,
  sanitizeText,
} from "../src/lib/validation";
import { contrastRatio, utf8Bytes } from "../src/lib/qr-render";

test("sanitizeText : contrôle les caractères, les sauts de ligne et la longueur", () => {
  assert.equal(sanitizeText("  bonjour\u0007  "), "bonjour");
  assert.equal(sanitizeText("a\r\nb"), "a\nb");
  assert.equal(sanitizeText("a\n\n\n\n\nb"), "a\n\n\nb");
  assert.equal(sanitizeText("x".repeat(50), 10).length, 10);
  assert.equal(sanitizeText(42), "");
});

test("sanitizeLine : applatis les sauts de ligne en espaces", () => {
  assert.equal(sanitizeLine("un\ndeux\ntrois"), "un deux trois");
});

test("safeColor : n'accepte que du hexadécimal, sinon repli", () => {
  assert.equal(safeColor("#A1B2C3", "#000000"), "#a1b2c3");
  assert.equal(safeColor("red", "#17151f"), "#17151f");
  assert.equal(safeColor("#fff", "#17151f"), "#17151f");
  assert.equal(safeColor("javascript:alert(1)", "#17151f"), "#17151f");
});

test("randomId : longueur, alphabet non ambigu et diversité", () => {
  const id = randomId(8);
  assert.equal(id.length, 8);
  assert.match(id, /^[23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ]+$/);
  assert.notEqual(randomId(12), randomId(12));
});

test("formatBytes : unités lisibles", () => {
  assert.equal(formatBytes(0), "0 Ko");
  assert.equal(formatBytes(2048), "2 Ko");
  assert.equal(formatBytes(3 * 1024 * 1024), "3.0 Mo");
});

test("utf8Bytes : compte les octets réels (accents, emoji)", () => {
  assert.equal(utf8Bytes("abc"), 3);
  assert.equal(utf8Bytes("é"), 2);
  assert.ok(utf8Bytes("🎁") >= 4);
});

test("contrastRatio : noir/blanc = 21, couleurs identiques = 1", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#17151f", "#17151f"), 1);
});
