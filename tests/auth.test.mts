import { test } from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_SECRET = "secret-de-test-long-et-aleatoire";
process.env.ADMIN_PASSWORD = "mot-de-passe-de-test";

const { signAdminToken, verifyAdminToken, checkPassword } = await import("../src/lib/admin-auth");

test("token admin : signature valide acceptée, falsification rejetée", () => {
  const token = signAdminToken();
  assert.equal(verifyAdminToken(token), true);
  assert.equal(verifyAdminToken(`${token.slice(0, -3)}abc`), false);
  assert.equal(verifyAdminToken("pas-un-token"), false);
  assert.equal(verifyAdminToken(undefined), false);
});

test("token admin : un token expiré est refusé", () => {
  const expired = signAdminToken(Date.now() - 1000);
  assert.equal(verifyAdminToken(expired), false);
});

test("checkPassword : comparaison exacte, rejet des autres valeurs", () => {
  assert.equal(checkPassword("mot-de-passe-de-test"), true);
  assert.equal(checkPassword("mauvais"), false);
  assert.equal(checkPassword(""), false);
});
