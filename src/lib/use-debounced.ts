"use client";

import { useEffect, useState } from "react";

/**
 * Valeur « débrayée » : ne change qu'après `delay` ms sans nouvelle valeur.
 * Utilisé pour éviter de reconstruire toute la matrice QR à chaque frappe.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
