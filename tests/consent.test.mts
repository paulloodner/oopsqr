import { test } from "node:test";
import assert from "node:assert/strict";

// Minimal browser mock : localStorage + écoute d'événements.
const store = new Map<string, string>();
const events: Array<{ type: string; detail?: unknown }> = [];

(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  },
  dispatchEvent: (event: { type: string; detail?: unknown }) => {
    events.push({ type: event.type, detail: event.detail });
    return true;
  },
};

const { CONSENT_KEY, CONSENT_EVENT, readConsent, writeConsent, resetConsent } = await import(
  "../src/lib/consent"
);

test("writeConsent / readConsent : valeurs acceptées et invalides", () => {
  assert.equal(readConsent(), null);
  writeConsent("accepted");
  assert.equal(readConsent(), "accepted");
  assert.equal(store.get(CONSENT_KEY), "accepted");
  writeConsent("refused");
  assert.equal(readConsent(), "refused");
  store.set(CONSENT_KEY, "n-importe-quoi");
  assert.equal(readConsent(), null);
});

test("resetConsent : efface la décision et notifie les emplacements", () => {
  writeConsent("accepted");
  resetConsent();
  assert.equal(readConsent(), null);
  const last = events[events.length - 1];
  assert.equal(last.type, CONSENT_EVENT);
  assert.deepEqual(last.detail, { consent: null });
});
