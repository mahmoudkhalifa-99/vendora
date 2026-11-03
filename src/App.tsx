import { MessageCircle, PackageSearch, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CategoryIcon } from './components/CategoryIcon';
import { CustomRequest } from './components/CustomRequest';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CATEGORIES, STORE } from './config';
import { PRODUCTS } from './data/products';
import { fmt, normalize } from './lib/format';
import { cartTotal } from './lib/whatsapp';
import { useCart } from './lib/useCart';
import type { CategoryId } from './types';

type Sort = 'default' | 'price-asc' | 'price-desc';

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));
const VALID_IDS = new Set(PRODUCT_MAP.keys());
const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))].sort() as string[];

export default function App() {
  const cart = useCart(VALID_IDS);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<Sort>('default');
  const [cartOpen, setCartOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    let list = PRODUCTS.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (!q) return true;
      return normalize([p.nameAr, p.nameEn, p.partNumber, p.brand, p.boilerCompatibility].filter(Boolean).join(' ')).includes(q);
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, category, brand, sort]);

  const qtyInCart = (id: string) => cart.lines.find((l) => l.id === id)?.qty ?? 0;
  const openProduct = openId ? PRODUCT_MAP.get(openId) : undefined;
  const filtersActive = query || category !== 'all' || brand;
  const reset = () => { setQuery(''); setCategory('all'); setBrand(''); setSort('default'); };

  return (
    <>
      <Header query={query} onQuery={setQuery} count={cart.count} onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero />

        <section id="catalog" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10">
          <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">كتالوج القطع</h2>

          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2" role="tablist" aria-label="أقسام القطع">
            {[{ id: 'all' as const, label: 'كل القطع' }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                onClick={() => setCategory(c.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${category === c.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-navy-700'}`}
              >
                <CategoryIcon id={c.id} className="h-4 w-4" /> {c.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="الماركة" className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold" dir="ltr">
              <option value="">كل الماركات</option>
              {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="الترتيب" className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold">
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: الأقل أولاً</option>
              <option value="price-desc">السعر: الأعلى أولاً</option>
            </select>
            <span className="text-sm text-slate-500" aria-live="polite">{results.length} قطعة</span>
            {filtersActive && <button type="button" onClick={reset} className="text-sm font-bold text-flame-700 underline">مسح الفلاتر</button>}
          </div>

          {results.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <PackageSearch className="mx-auto h-12 w-12 text-slate-400" aria-hidden />
              <h3 className="mt-3 text-lg font-bold">مفيش نتائج مطابقة</h3>
              <p className="mt-1 text-sm text-slate-500">جرّب كلمات تانية أو اطلب القطعة مباشرة وهنوفرها لك.</p>
              <div className="mt-4 flex justify-center gap-3">
                <button type="button" onClick={reset} className="rounded-xl bg-navy-900 px-5 py-2.5 font-bold text-white">عرض كل القطع</button>
                <a href="#custom" className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold">اطلب قطعة خاصة</a>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} inCart={qtyInCart(p.id)} onAdd={() => cart.add(p.id)} onOpen={() => setOpenId(p.id)} />
              ))}
            </div>
          )}
        </section>

        <CustomRequest />
      </main>
      <Footer />
      <div className="h-20 bg-navy-950 md:hidden" aria-hidden />

      {/* شريط السلة السفلي للموبايل */}
      {cart.count > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="anim-pop fixed inset-x-4 bottom-4 z-30 flex h-14 items-center justify-between rounded-2xl bg-wa-dark px-5 font-bold text-white shadow-2xl md:hidden"
        >
          <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" aria-hidden /> {cart.count} قطعة</span>
          <span className="flex items-center gap-2">{fmt(cartTotal(cart.lines, PRODUCT_MAP))} {STORE.currency} · إتمام الشراء <MessageCircle className="h-5 w-5" aria-hidden /></span>
        </button>
      )}

      {openProduct && <ProductModal product={openProduct} onClose={() => setOpenId(null)} onAdd={(q) => cart.add(openProduct.id, q)} />}
      {cartOpen && (
        <CartDrawer
          lines={cart.lines}
          products={PRODUCT_MAP}
          customer={cart.customer}
          onCustomer={cart.setCustomer}
          onQty={cart.setQty}
          onRemove={cart.remove}
          onClear={cart.clear}
          onClose={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
