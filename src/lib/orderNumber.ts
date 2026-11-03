import { doc, runTransaction } from 'firebase/firestore/lite';
import { getDb, isFirebaseConfigured } from './firebase';

/** عدّاد الطلبات المشترك بين كل الزوار (مستند واحد في Firestore). */
export const COL_COUNTERS = 'vendora_counters';
const DOC_ID = 'orders';

/** أول رقم في كل دفعة، وعدد الطلبات في الدفعة الواحدة */
const START = 1001;
const BLOCK = 1000;

/**
 * يحوّل الترتيب الكلي للطلب (1، 2، 3 ...) لرقم الطلب:
 * الطلب 1 → 1001-1 ، الطلب 2 → 1002-1 ، ... الطلب 1000 → 2000-1
 * الطلب 1001 → 1001-2 ، وهكذا.
 */
export function formatOrderNumber(seq: number): string {
  const i = seq - 1;
  return `${START + (i % BLOCK)}-${Math.floor(i / BLOCK) + 1}`;
}

/** يحجز الرقم التالي بشكل ذري. لو تعذّر (أوفلاين / Firebase مش متظبط) يرجّع null. */
export async function reserveOrderNumber(): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const ref = doc(getDb(), COL_COUNTERS, DOC_ID);
    const seq = await runTransaction(getDb(), async (tx) => {
      const snap = await tx.get(ref);
      const next = (snap.exists() ? (snap.data().n as number) : 0) + 1;
      tx.set(ref, { n: next });
      return next;
    });
    return formatOrderNumber(seq);
  } catch (err) {
    console.error('تعذّر حجز رقم الطلب', err);
    return null;
  }
}
