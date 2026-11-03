import { MessageCircle, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CATEGORIES, STORE } from '../config';
import { fmt } from '../lib/format';
import { buildInquiry, waLink } from '../lib/whatsapp';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';
import { QtyStepper } from './QtyStepper';

export function ProductModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const specs: [string, string | undefined][] = [
    ['كود القطعة', product.partNumber],
    ['الماركة', product.brand],
    ['المنشأ', product.originCountry],
    ['الضغط', product.pressureRating],
    ['المقاس / التوصيل', product.connectionSize],
    ['أقصى حرارة', product.temperatureMax],
    ['التوافق', product.boilerCompatibility],
    ['ملاحظات فنية', product.technicalNotes],
  ];
  const category = CATEGORIES.find((c) => c.id === product.category)?.label;

  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-navy-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.nameAr}
        onClick={(e) => e.stopPropagation()}
        className="anim-pop relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl md:flex-row"
      >
        <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white">
          <X className="h-5 w-5" />
        </button>

        <div className="h-52 shrink-0 md:h-auto md:w-2/5">
          <ProductImage product={product} large />
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {category && <span className="text-xs font-bold text-flame-700">{category}</span>}
          <h2 className="mt-1 text-xl font-extrabold leading-snug text-slate-900">{product.nameAr}</h2>
          <p dir="ltr" className="mt-1 text-start text-sm text-slate-500">{product.nameEn}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">{product.descriptionAr}</p>

          <dl className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 text-sm">
            {specs.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-2.5 odd:bg-slate-50">
                <dt className="font-semibold text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div>
              <span className="text-2xl font-extrabold tabular-nums text-navy-900">{fmt(product.price * qty)}</span>
              <span className="mr-1 text-sm font-semibold text-slate-500">{STORE.currency}</span>
              <p className="text-xs text-slate-500">{fmt(product.price)} {STORE.currency} لكل {product.unit}</p>
            </div>
            <QtyStepper value={qty} onChange={setQty} label="الكمية" />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => { onAdd(qty); onClose(); }}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-flame-600 font-bold text-white shadow hover:bg-flame-700"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden /> أضف للسلة
            </button>
            <a
              href={waLink(buildInquiry(product))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-wa-dark px-5 font-bold text-wa-dark hover:bg-emerald-50"
            >
              <MessageCircle className="h-5 w-5" aria-hidden /> استفسار
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
