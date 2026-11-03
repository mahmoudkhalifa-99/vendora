import { useEffect, useState } from 'react';
import { PRODUCTS } from '../data/products';
import type { Product } from '../types';
import { loadCatalog } from './catalog';
import { isFirebaseConfigured } from './firebase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    loadCatalog()
      .then((list) => !cancelled && setProducts(list ?? PRODUCTS))
      .catch(() => undefined) // لو فشل الاتصال نعرض البيانات المدمجة
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}
