import { Flame, Phone, Search, ShoppingCart } from 'lucide-react';
import { STORE } from '../config';

export function Header({
  query,
  onQuery,
  count,
  onOpenCart,
}: {
  query: string;
  onQuery: (q: string) => void;
  count: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label={STORE.name}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-flame-500 shadow-inner">
            <Flame className="h-6 w-6 text-white" aria-hidden />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-extrabold">{STORE.name}</span>
            <span className="block text-[11px] text-slate-300">{STORE.tagline}</span>
          </span>
        </a>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              onQuery(e.target.value);
              if (e.target.value) document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            placeholder="ابحث باسم القطعة أو الكود أو الماركة..."
            aria-label="بحث في القطع"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/10 pr-10 pl-3 text-sm text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400"
          />
        </div>

        <a href={`tel:${STORE.phoneLocal}`} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 lg:flex">
          <Phone className="h-4 w-4 text-flame-400" aria-hidden />
          <span dir="ltr">{STORE.phoneDisplay}</span>
        </a>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex h-11 shrink-0 items-center gap-2 rounded-xl bg-flame-600 px-4 font-bold shadow hover:bg-flame-700"
          aria-label={`فتح السلة، ${count} قطعة`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">السلة</span>
          {count > 0 && (
            <span className="absolute -left-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-white px-1 text-xs font-extrabold text-flame-700 shadow">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
