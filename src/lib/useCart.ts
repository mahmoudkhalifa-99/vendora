import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CartLine, CustomerInfo } from '../types';

const CART_KEY = 'boiler-cart-v1';
const CUSTOMER_KEY = 'boiler-customer-v1';
const MAX_QTY = 9999;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* التخزين غير متاح – الموقع يشتغل عادي */
  }
}

export const EMPTY_CUSTOMER: CustomerInfo = { name: '', phone: '', company: '', city: '', notes: '' };

export function useCart(validIds: Set<string>) {
  const [lines, setLines] = useState<CartLine[]>(() =>
    load<CartLine[]>(CART_KEY, []).filter(
      (l) => validIds.has(l.id) && Number.isFinite(l.qty) && l.qty > 0,
    ),
  );
  const [customer, setCustomer] = useState<CustomerInfo>(() => ({
    ...EMPTY_CUSTOMER,
    ...load<Partial<CustomerInfo>>(CUSTOMER_KEY, {}),
    notes: '',
  }));

  useEffect(() => save(CART_KEY, lines), [lines]);
  useEffect(() => save(CUSTOMER_KEY, { ...customer, notes: '' }), [customer]);

  const clamp = (q: number) => Math.min(MAX_QTY, Math.max(0, Math.floor(q) || 0));

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) return prev.map((l) => (l.id === id ? { ...l, qty: clamp(l.qty + qty) } : l));
      return [...prev, { id, qty: clamp(qty) }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    const q = clamp(qty);
    setLines((prev) => (q === 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty: q } : l))));
  }, []);

  const remove = useCallback((id: string) => setLines((p) => p.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  return { lines, add, setQty, remove, clear, count, customer, setCustomer };
}
