import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { STORE } from '../config';
import { fmt } from '../lib/format';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';

export function ProductCard({
  product,
  inCart,
  onAdd,
  onOpen,
}: {
  product: Product;
  inCart: number;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const [flash, setFlash] = useState(false);
  const handleAdd = () => {
    onAdd();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1200);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <button type="button" onClick={onOpen} className="relative block aspect-[16/9] sm:aspect-[4/3] w-full overflow-hidden" aria-label={`تفاصيل ${product.nameAr}`}>
        <ProductImage product={product} />
        {inCart > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-flame-600 px-2.5 py-1 text-xs font-bold text-white shadow">في السلة: {inCart}</span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          {product.brand && <span dir="ltr" className="rounded-md bg-navy-900/5 px-2 py-0.5 font-bold text-navy-800">{product.brand}</span>}
          {product.partNumber && <span dir="ltr" className="truncate font-mono text-slate-500">{product.partNumber}</span>}
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[2.8em] text-sm font-bold leading-snug text-slate-900">
          <button type="button" onClick={onOpen} className="text-start hover:text-flame-700">{product.nameAr}</button>
        </h3>

        {product.originCountry && <p className="mt-1 text-xs text-slate-500">المنشأ: {product.originCountry}</p>}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <span className="text-xl font-extrabold tabular-nums text-navy-900">{fmt(product.price)}</span>
            <span className="mr-1 text-xs font-semibold text-slate-500">{STORE.currency} / {product.unit}</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white shadow transition ${flash ? 'bg-emerald-600' : 'bg-flame-600 hover:bg-flame-700'}`}
          >
            {flash ? <Check className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
            {flash ? 'تمت الإضافة' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </article>
  );
}
