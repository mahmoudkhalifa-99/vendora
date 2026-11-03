import { MessageCircle, ShoppingCart, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { STORE } from '../config';
import { fmt } from '../lib/format';
import { buildOrderMessage, cartTotal, waLink } from '../lib/whatsapp';
import type { CartLine, CustomerInfo, Product } from '../types';
import { ProductImage } from './ProductImage';
import { QtyStepper } from './QtyStepper';

interface Props {
  lines: CartLine[];
  products: Map<string, Product>;
  customer: CustomerInfo;
  onCustomer: (c: CustomerInfo) => void;
  onQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const inputCls =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-flame-500';

export function CartDrawer({ lines, products, customer, onCustomer, onQty, onRemove, onClear, onClose }: Props) {
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [sent, setSent] = useState(false);
  const total = cartTotal(lines, products);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = (k: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onCustomer({ ...customer, [k]: e.target.value });

  const checkout = () => {
    const next: typeof errors = {};
    if (customer.name.trim().length < 2) next.name = 'من فضلك اكتب اسمك';
    const digits = customer.phone.replace(/\D/g, '');
    if (customer.phone.trim() && digits.length < 8) next.phone = 'رقم الموبايل غير صحيح';
    setErrors(next);
    if (Object.keys(next).length) return;

    const url = waLink(buildOrderMessage(lines, products, customer));
    const w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
    setSent(true);
  };

  return (
    <div className="anim-fade fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة الطلبات"
        onClick={(e) => e.stopPropagation()}
        className="anim-slide absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-slate-50 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
            <ShoppingCart className="h-5 w-5 text-flame-600" aria-hidden /> سلة الطلبات
            {lines.length > 0 && <span className="rounded-full bg-flame-100 px-2 text-sm text-flame-700">{lines.length}</span>}
          </h2>
          <button type="button" onClick={onClose} aria-label="إغلاق السلة" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-slate-200 text-slate-400">
              <ShoppingCart className="h-9 w-9" aria-hidden />
            </span>
            <h3 className="text-lg font-bold text-slate-800">السلة فاضية</h3>
            <p className="text-sm text-slate-500">أضف القطع اللي محتاجها وبعدين أكمل الطلب على واتساب.</p>
            <button type="button" onClick={onClose} className="mt-2 rounded-xl bg-navy-900 px-6 py-3 font-bold text-white hover:bg-navy-800">تصفّح القطع</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <ul className="space-y-3">
                {lines.map((l) => {
                  const p = products.get(l.id);
                  if (!p) return null;
                  return (
                    <li key={l.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><ProductImage product={p} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{p.nameAr}</h3>
                          <button type="button" onClick={() => onRemove(l.id)} aria-label={`حذف ${p.nameAr}`} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {p.partNumber && <p dir="ltr" className="mt-0.5 text-start font-mono text-[11px] text-slate-500">{p.partNumber}</p>}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QtyStepper size="sm" value={l.qty} onChange={(q) => onQty(l.id, q)} label={`كمية ${p.nameAr}`} />
                          <div className="text-end">
                            <div className="font-extrabold tabular-nums text-navy-900">{fmt(p.price * l.qty)} <span className="text-xs font-semibold">{STORE.currency}</span></div>
                            <div className="text-[11px] text-slate-500">{fmt(p.price)} / {p.unit}</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button type="button" onClick={onClear} className="text-xs font-semibold text-slate-500 underline hover:text-red-600">تفريغ السلة</button>

              <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); checkout(); }} noValidate>
                <h3 className="font-extrabold text-navy-900">بيانات العميل</h3>
                <div>
                  <label htmlFor="c-name" className="mb-1 block text-xs font-bold text-slate-600">الاسم *</label>
                  <input id="c-name" className={inputCls} value={customer.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
                  {errors.name && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="c-phone" className="mb-1 block text-xs font-bold text-slate-600">الموبايل</label>
                    <input id="c-phone" dir="ltr" inputMode="tel" className={`${inputCls} text-end`} value={customer.phone} onChange={set('phone')} autoComplete="tel" aria-invalid={!!errors.phone} />
                    {errors.phone && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-company" className="mb-1 block text-xs font-bold text-slate-600">الشركة / المصنع</label>
                    <input id="c-company" className={inputCls} value={customer.company} onChange={set('company')} autoComplete="organization" />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-city" className="mb-1 block text-xs font-bold text-slate-600">المدينة / عنوان التسليم</label>
                  <input id="c-city" className={inputCls} value={customer.city} onChange={set('city')} autoComplete="address-level2" />
                </div>
                <div>
                  <label htmlFor="c-notes" className="mb-1 block text-xs font-bold text-slate-600">ملاحظات (موديل الغلاية، مواصفات...)</label>
                  <textarea id="c-notes" rows={3} className={`${inputCls} h-auto py-2`} value={customer.notes} onChange={set('notes')} />
                </div>
              </form>
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              {sent && (
                <div role="status" className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                  تم فتح واتساب بالطلب كامل. لو لم يفتح اضغط إتمام الشراء مرة أخرى.
                  <button type="button" onClick={() => { onClear(); setSent(false); onClose(); }} className="mr-1 font-bold underline">بعد إرسال الرسالة، فرّغ السلة</button>
                </div>
              )}
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-semibold text-slate-600">الإجمالي التقريبي</span>
                <span className="text-2xl font-extrabold tabular-nums text-navy-900">{fmt(total)} <span className="text-sm">{STORE.currency}</span></span>
              </div>
              <button
                type="button"
                onClick={checkout}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-wa-dark text-lg font-extrabold text-white shadow-lg transition hover:brightness-110"
              >
                <MessageCircle className="h-6 w-6" aria-hidden /> إتمام الشراء عبر واتساب
              </button>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
                الأسعار استرشادية، ويتم تأكيد السعر النهائي والتوفر وموعد التسليم معك على واتساب.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
