import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite';
import type { Product } from '../types';
import { COL_PRODUCTS, COL_SETTINGS, getDb } from './firebase';

export const sortProducts = (list: Product[]) =>
  [...list].sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));

/**
 * يرجّع المنتجات المنشورة من Firestore، أو null لو الكتالوج لسه ما اتفعّلش
 * (يعني الأدمن لسه ما استوردش المنتجات الافتراضية) فنستخدم البيانات المدمجة.
 */
export async function loadCatalog(): Promise<Product[] | null> {
  const db = getDb();
  const meta = await getDoc(doc(db, COL_SETTINGS, 'catalog'));
  if (!meta.exists() || !meta.data().seeded) return null;
  const snap = await getDocs(collection(db, COL_PRODUCTS));
  const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Product, 'id'>), id: d.id }));
  return sortProducts(list.filter((p) => p.active !== false));
}
