import { useState } from 'react';
import type { Product } from '../types';
import { CategoryIcon } from './CategoryIcon';

/** صورة المنتج لو موجودة، وإلا لوحة هندسية بأيقونة القسم واسم الماركة */
export function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (product.image && !failed) {
    return (
      <img
        src={product.image}
        alt={product.nameAr}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="blueprint flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy-900 to-navy-700 text-white">
      <CategoryIcon id={product.category} className={large ? 'h-20 w-20 text-flame-400' : 'h-12 w-12 text-flame-400'} />
      {product.brand && (
        <span dir="ltr" className={`rounded-full bg-white/10 px-3 py-0.5 font-semibold tracking-wide text-white/90 ${large ? 'text-sm' : 'text-[11px]'}`}>
          {product.brand}
        </span>
      )}
    </div>
  );
}
