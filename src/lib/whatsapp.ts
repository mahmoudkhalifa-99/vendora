import { STORE } from '../config';
import type { CartLine, CustomerInfo, Product } from '../types';
import { fmt } from './format';

const LINE = '━━━━━━━━━━━━━━';

export const waLink = (text: string) =>
  `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const cartTotal = (lines: CartLine[], products: Map<string, Product>) =>
  lines.reduce((sum, l) => sum + (products.get(l.id)?.price ?? 0) * l.qty, 0);

/** رسالة الطلب الكاملة اللي بتتبعت على الواتساب */
export function buildOrderMessage(
  lines: CartLine[],
  products: Map<string, Product>,
  customer: CustomerInfo,
): string {
  const now = new Date();
  const ref = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  const items = lines
    .map((l, i) => {
      const p = products.get(l.id);
      if (!p) return '';
      const meta = [p.partNumber && `الكود: ${p.partNumber}`, p.brand && `الماركة: ${p.brand}`]
        .filter(Boolean)
        .join(' | ');
      return [
        `${i + 1}) ${p.nameAr}`,
        meta && `   ${meta}`,
        `   الكمية: ${l.qty} ${p.unit} × ${fmt(p.price)} = ${fmt(p.price * l.qty)} ${STORE.currency}`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .filter(Boolean)
    .join('\n\n');

  const totalQty = lines.reduce((s, l) => s + l.qty, 0);

  const customerBlock = [
    `الاسم: ${customer.name.trim()}`,
    customer.phone.trim() && `الموبايل: ${customer.phone.trim()}`,
    customer.company.trim() && `الشركة / المصنع: ${customer.company.trim()}`,
    customer.city.trim() && `المدينة / العنوان: ${customer.city.trim()}`,
  ]
    .filter(Boolean)
    .join('\n');

  return [
    `*طلب جديد من الموقع* (رقم ${ref})`,
    LINE,
    '*بيانات العميل*',
    customerBlock,
    LINE,
    '*الأصناف المطلوبة*',
    items,
    LINE,
    `عدد الأصناف: ${lines.length} | إجمالي الكميات: ${totalQty}`,
    `*الإجمالي التقريبي: ${fmt(cartTotal(lines, products))} ${STORE.currency}*`,
    customer.notes.trim() && `${LINE}\nملاحظات: ${customer.notes.trim()}`,
    LINE,
    'برجاء تأكيد التوفر والسعر النهائي وموعد التسليم.',
  ]
    .filter(Boolean)
    .join('\n');
}

export const buildInquiry = (p: Product) =>
  `السلام عليكم، عايز أستفسر عن القطعة دي:\n${p.nameAr}\n${p.partNumber ? `الكود: ${p.partNumber}\n` : ''}`;
