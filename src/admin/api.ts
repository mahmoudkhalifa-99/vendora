import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore/lite';
import { PRODUCTS } from '../data/products';
import { COL_PRODUCTS, COL_SETTINGS, getDb } from '../lib/firebase';
import { sortProducts } from '../lib/catalog';
import type { Product } from '../types';

const clean = (p: Product): Omit<Product, 'id'> => {
  const { id: _id, ...rest } = p;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined && v !== '')) as Omit<Product, 'id'>;
};

export async function fetchAll(): Promise<{ products: Product[]; seeded: boolean }> {
  const db = getDb();
  const [meta, snap] = await Promise.all([getDoc(doc(db, COL_SETTINGS, 'catalog')), getDocs(collection(db, COL_PRODUCTS))]);
  const products = snap.docs.map((d) => ({ ...(d.data() as Omit<Product, 'id'>), id: d.id }));
  return { products: sortProducts(products), seeded: Boolean(meta.exists() && meta.data().seeded) };
}

export async function saveProduct(p: Product) {
  const db = getDb();
  await setDoc(doc(db, COL_PRODUCTS, p.id), clean(p));
}

/** يفعّل الكتالوج الحي بدون استيراد المنتجات الافتراضية */
export const startEmpty = () => setDoc(doc(getDb(), COL_SETTINGS, 'catalog'), { seeded: true });

export const removeProduct = (id: string) => deleteDoc(doc(getDb(), COL_PRODUCTS, id));

export const setActive = (p: Product, active: boolean) =>
  setDoc(doc(getDb(), COL_PRODUCTS, p.id), clean({ ...p, active }));

/** ينقل المنتجات الافتراضية لقاعدة البيانات ويفعّل الكتالوج الحي */
export async function importDefaults() {
  const db = getDb();
  const batch = writeBatch(db);
  PRODUCTS.forEach((p, i) => batch.set(doc(db, COL_PRODUCTS, p.id), clean({ ...p, active: true, sortIndex: i })));
  batch.set(doc(db, COL_SETTINGS, 'catalog'), { seeded: true });
  await batch.commit();
}

export const newId = () => `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
