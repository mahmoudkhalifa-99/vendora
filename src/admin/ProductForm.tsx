import { ImagePlus, Link2, Star, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { CATEGORIES } from '../config';
import type { CategoryId, Product } from '../types';
import { compressImage } from './image';

const MAX_IMAGES = 4;
const MAX_DOC_CHARS = 900_000; // حد Firestore للمستند 1MB

const input = 'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-flame-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function permissionHint(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (code.includes('permission-denied')) return 'مفيش صلاحية. تأكد إن إيميلك مضاف في قواعد Firestore (ملف firestore.rules) وإنك نشرتها.';
  if (code.includes('unavailable') || code.includes('network')) return 'مشكلة في الاتصال بالإنترنت. حاول تاني.';
  return 'حصل خطأ. حاول تاني.';
}

export function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Product;
  onSave: (p: Product) => Promise<void>;
  onCancel: () => void;
}) {
  const [p, setP] = useState<Product>(initial);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : '');
  const [urlInput, setUrlInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const images = p.images ?? [];

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((s) => ({ ...s, [k]: v }));
  const text = (k: keyof Product) => ({
    value: (p[k] as string | undefined) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
  });

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    const room = MAX_IMAGES - images.length;
    if (room <= 0) return setError(`الحد الأقصى ${MAX_IMAGES} صور`);
    try {
      const added = await Promise.all([...files].slice(0, room).map((f) => compressImage(f)));
      setP((s) => ({ ...s, images: [...(s.images ?? []), ...added] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذّر رفع الصورة');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!/^https?:\/\//i.test(u)) return setError('الرابط لازم يبدأ بـ https://');
    if (images.length >= MAX_IMAGES) return setError(`الحد الأقصى ${MAX_IMAGES} صور`);
    setError('');
    set('images', [...images, u]);
    setUrlInput('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    if (p.nameAr.trim().length < 3) return setError('اكتب اسم القطعة بالعربي');
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError('اكتب سعر صحيح أكبر من صفر');
    const out: Product = { ...p, nameAr: p.nameAr.trim(), nameEn: (p.nameEn ?? '').trim(), price: priceNum };
    if (JSON.stringify(out).length > MAX_DOC_CHARS) return setError('حجم الصور كبير، قلّل عدد الصور أو استخدم صور أصغر');
    setBusy(true);
    setError('');
    try {
      await onSave(out);
    } catch (err) {
      setError(permissionHint(err));
      setBusy(false);
    }
  };

  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-navy-950/70 backdrop-blur-sm sm:items-center sm:p-6">
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label="بيانات القطعة"
        className="anim-pop flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-extrabold text-navy-900">{initial.nameAr ? 'تعديل قطعة' : 'إضافة قطعة جديدة'}</h2>
          <button type="button" onClick={onCancel} aria-label="إغلاق" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <h3 className="mb-2 text-sm font-extrabold text-navy-900">الصور ({images.length}/{MAX_IMAGES})</h3>
            <div className="flex flex-wrap gap-3">
              {images.map((src, i) => (
                <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img src={src} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute right-1 top-1 rounded bg-flame-600 px-1.5 text-[10px] font-bold text-white">رئيسية</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                    {i !== 0 ? (
                      <button type="button" aria-label="اجعلها الرئيسية" onClick={() => set('images', [src, ...images.filter((_, j) => j !== i)])} className="text-white"><Star className="h-4 w-4" /></button>
                    ) : <span />}
                    <button type="button" aria-label="حذف الصورة" onClick={() => set('images', images.filter((_, j) => j !== i))} className="text-white"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileRef.current?.click()} className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-flame-500 hover:text-flame-600">
                  <span className="flex flex-col items-center gap-1 text-xs font-bold"><ImagePlus className="h-6 w-6" />إضافة صورة</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            <div className="mt-3 flex gap-2">
              <input dir="ltr" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="أو الصق رابط صورة https://..." aria-label="رابط صورة" className={`${input} flex-1`} />
              <button type="button" onClick={addUrl} className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-4 text-sm font-bold hover:bg-slate-50"><Link2 className="h-4 w-4" />إضافة</button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">الصور بتتصغّر تلقائي قبل الحفظ. الصورة الأولى هي اللي بتظهر في الكتالوج.</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="اسم القطعة (عربي) *"><input className={input} {...text('nameAr')} /></Field></div>
            <div className="sm:col-span-2"><Field label="الاسم بالإنجليزي"><input dir="ltr" className={`${input} text-start`} {...text('nameEn')} /></Field></div>
            <Field label="القسم *">
              <select className={input} value={p.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="السعر (جنيه) *"><input inputMode="decimal" type="number" min="0" step="any" className={input} value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
              <Field label="وحدة البيع">
                <select className={input} value={p.unit} onChange={(e) => set('unit', e.target.value as Product['unit'])}>
                  <option value="قطعة">قطعة</option>
                  <option value="متر">متر</option>
                </select>
              </Field>
            </div>
            <div className="sm:col-span-2"><Field label="الوصف"><textarea rows={3} className={`${input} h-auto py-2`} {...text('descriptionAr')} /></Field></div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-extrabold text-navy-900">المواصفات الفنية</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="كود القطعة"><input dir="ltr" className={`${input} text-start`} {...text('partNumber')} /></Field>
              <Field label="الماركة"><input dir="ltr" className={`${input} text-start`} {...text('brand')} /></Field>
              <Field label="بلد المنشأ"><input className={input} {...text('originCountry')} /></Field>
              <Field label="الضغط"><input dir="ltr" className={`${input} text-start`} {...text('pressureRating')} /></Field>
              <Field label="المقاس / نوع التوصيل"><input dir="ltr" className={`${input} text-start`} {...text('connectionSize')} /></Field>
              <Field label="أقصى درجة حرارة"><input dir="ltr" className={`${input} text-start`} {...text('temperatureMax')} /></Field>
              <div className="sm:col-span-2"><Field label="التوافق مع الغلايات"><input className={input} {...text('boilerCompatibility')} /></Field></div>
              <div className="sm:col-span-2"><Field label="ملاحظات فنية"><textarea rows={2} className={`${input} h-auto py-2`} {...text('technicalNotes')} /></Field></div>
            </div>
          </section>

          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold">
            <input type="checkbox" className="h-5 w-5 accent-flame-600" checked={p.active !== false} onChange={(e) => set('active', e.target.checked)} />
            ظاهرة للزوار على الموقع
          </label>
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="h-12 flex-1 rounded-xl bg-flame-600 font-bold text-white hover:bg-flame-700 disabled:opacity-60">{busy ? 'جاري الحفظ...' : 'حفظ القطعة'}</button>
            <button type="button" onClick={onCancel} className="h-12 rounded-xl border border-slate-300 px-6 font-bold hover:bg-slate-50">إلغاء</button>
          </div>
        </div>
      </form>
    </div>
  );
}
