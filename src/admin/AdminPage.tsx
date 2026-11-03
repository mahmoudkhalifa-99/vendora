import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { ArrowRight, Download, Eye, EyeOff, LogOut, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { CATEGORIES, STORE } from '../config';
import { PRODUCTS } from '../data/products';
import { getFirebaseApp, isFirebaseConfigured } from '../lib/firebase';
import { fmt, normalize } from '../lib/format';
import type { Product } from '../types';
import { fetchAll, importDefaults, newId, removeProduct, saveProduct, setActive, startEmpty } from './api';
import { ProductForm, permissionHint } from './ProductForm';

const auth = () => getAuth(getFirebaseApp());
const goSite = () => {
  window.location.hash = '';
};

function Shell({ children, user }: { children: React.ReactNode; user?: User | null }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-navy-900 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white px-2 py-1"><img src={STORE.logo} alt={STORE.name} className="h-9 w-auto" /></span>
            <span className="text-sm font-bold text-slate-200">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button type="button" onClick={goSite} className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold hover:bg-white/10"><ArrowRight className="h-4 w-4" aria-hidden />الموقع</button>
            {user && (
              <button type="button" onClick={() => signOut(auth())} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 font-semibold hover:bg-white/20"><LogOut className="h-4 w-4" aria-hidden />خروج</button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function SetupNotice() {
  return (
    <Shell>
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-extrabold text-navy-900">لازم تربط Firebase الأول</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          انسخ ملف <code dir="ltr" className="rounded bg-slate-100 px-1">.env.example</code> باسم <code dir="ltr" className="rounded bg-slate-100 px-1">.env</code>، وحط بيانات المشروع فيه، وأعد تشغيل الموقع. الخطوات كاملة في ملف README.
        </p>
      </div>
    </Shell>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await signInWithEmailAndPassword(auth(), email.trim(), pass);
    } catch (error) {
      const code = (error as { code?: string }).code ?? '';
      setErr(
        code.includes('too-many') ? 'محاولات كتير، استنى شوية وجرّب تاني.'
        : code.includes('network') ? 'مشكلة في الاتصال بالإنترنت.'
        : code.includes('operation-not-allowed') ? 'تسجيل الدخول بالإيميل غير مفعّل في Firebase (Authentication > Sign-in method).'
        : 'الإيميل أو كلمة المرور غير صحيحة.',
      );
      setBusy(false);
    }
  };

  const cls = 'h-11 w-full rounded-xl border border-slate-300 px-3 text-start text-sm focus:border-flame-500';
  return (
    <Shell>
      <form onSubmit={submit} className="mx-auto mt-6 max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-extrabold text-navy-900">تسجيل دخول الإدارة</h1>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-slate-600">الإيميل</span>
          <input type="email" dir="ltr" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={cls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-slate-600">كلمة المرور</span>
          <input type="password" dir="ltr" required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} className={cls} />
        </label>
        {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{err}</p>}
        <button type="submit" disabled={busy} className="h-12 w-full rounded-xl bg-navy-900 font-bold text-white hover:bg-navy-800 disabled:opacity-60">{busy ? 'جاري الدخول...' : 'دخول'}</button>
      </form>
    </Shell>
  );
}

function Dashboard({ user }: { user: User }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [seeded, setSeeded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetchAll();
      setProducts(r.products);
      setSeeded(r.seeded);
      setError('');
    } catch (e) {
      setError(permissionHint(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(permissionHint(e));
    } finally {
      setBusy(false);
    }
  };

  const shown = useMemo(() => {
    const q = normalize(query);
    return q ? products.filter((p) => normalize(`${p.nameAr} ${p.nameEn} ${p.partNumber ?? ''} ${p.brand ?? ''}`).includes(q)) : products;
  }, [products, query]);

  const blank = (): Product => ({
    id: newId(), nameAr: '', nameEn: '', descriptionAr: '', price: 0, unit: 'قطعة', category: 'burners', active: true,
    sortIndex: products.reduce((m, p) => Math.min(m, p.sortIndex ?? 0), 0) - 1, images: [],
  });

  return (
    <Shell user={user}>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      {!loading && !seeded && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="font-extrabold text-amber-900">الكتالوج لسه مش مفعّل</h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
            الموقع حالياً بيعرض {PRODUCTS.length} قطعة مدمجة فيه. استورد القطع دي عشان تقدر تعدلها وتضيف عليها، أو ابدأ بكتالوج فاضي.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run(importDefaults)} className="flex items-center gap-2 rounded-xl bg-flame-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-flame-700 disabled:opacity-60"><Download className="h-4 w-4" aria-hidden />استيراد {PRODUCTS.length} قطعة</button>
            <button disabled={busy} onClick={() => run(startEmpty)} className="rounded-xl border border-amber-400 px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60">ابدأ بكتالوج فاضي</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold text-navy-900">القطع <span className="text-base font-semibold text-slate-500">({products.length})</span></h1>
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث..." aria-label="بحث" className="h-11 w-full rounded-xl border border-slate-300 bg-white pr-9 pl-3 text-sm" />
        </div>
        <button disabled={!seeded || loading} onClick={() => setEditing(blank())} className="flex h-11 items-center gap-2 rounded-xl bg-flame-600 px-5 font-bold text-white shadow hover:bg-flame-700 disabled:opacity-50"><Plus className="h-5 w-5" aria-hidden />إضافة قطعة</button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-slate-500">جاري التحميل...</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {shown.map((p) => (
            <li key={p.id} className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 ${p.active === false ? 'opacity-60' : ''}`}>
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-navy-900">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <CategoryIcon id={p.category} className="h-7 w-7 text-flame-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold">{p.nameAr}{p.active === false && <span className="mr-2 rounded bg-slate-200 px-1.5 text-[10px]">مخفية</span>}</h2>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {CATEGORIES.find((c) => c.id === p.category)?.label}{p.partNumber && <> · <span dir="ltr">{p.partNumber}</span></>}
                </p>
                <p className="mt-0.5 text-sm font-extrabold tabular-nums text-navy-900">{fmt(p.price)} {STORE.currency} <span className="text-xs font-semibold text-slate-500">/ {p.unit}</span></p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button disabled={busy} title={p.active === false ? 'إظهار' : 'إخفاء'} aria-label={p.active === false ? 'إظهار القطعة' : 'إخفاء القطعة'} onClick={() => run(() => setActive(p, p.active === false))} className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">
                  {p.active === false ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <button aria-label="تعديل" onClick={() => setEditing(p)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"><Pencil className="h-5 w-5" /></button>
                <button disabled={busy} aria-label="حذف" onClick={() => window.confirm(`حذف "${p.nameAr}" نهائياً؟`) && run(() => removeProduct(p.id))} className="grid h-10 w-10 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="h-5 w-5" /></button>
              </div>
            </li>
          ))}
          {shown.length === 0 && seeded && <li className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">مفيش قطع {query ? 'مطابقة للبحث' : 'لسه. اضغط إضافة قطعة'}.</li>}
        </ul>
      )}

      {editing && (
        <ProductForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={async (p) => {
            await saveProduct(p);
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </Shell>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(auth(), setUser);
  }, []);

  if (!isFirebaseConfigured) return <SetupNotice />;
  if (user === undefined) return <Shell><p className="mt-10 text-center text-slate-500">جاري التحميل...</p></Shell>;
  return user ? <Dashboard user={user} /> : <Login />;
}
