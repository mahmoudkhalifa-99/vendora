import { MessageCircle, PencilRuler } from 'lucide-react';
import { useState } from 'react';
import { waLink } from '../lib/whatsapp';

export function CustomRequest() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5) return setErr('اكتب اسم القطعة أو مواصفاتها');
    setErr('');
    const msg = `*طلب قطعة غير موجودة بالكتالوج*\n${name.trim() ? `الاسم: ${name.trim()}\n` : ''}المطلوب:\n${text.trim()}`;
    const url = waLink(msg);
    if (!window.open(url, '_blank', 'noopener')) window.location.href = url;
  };

  return (
    <section id="custom" className="bg-navy-900 py-14 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 md:grid-cols-2">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-flame-500/20 text-flame-400"><PencilRuler className="h-6 w-6" aria-hidden /></span>
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">مش لاقي القطعة المطلوبة؟</h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            اكتب اسم القطعة أو الكود أو موديل الغلاية وهنوفرها لك. نوفر قطع الماركات العالمية وبدائلها المعتمدة.
          </p>
        </div>
        <form onSubmit={send} noValidate className="space-y-3 rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
          <div>
            <label htmlFor="r-name" className="mb-1 block text-xs font-bold text-slate-600">الاسم</label>
            <input id="r-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm focus:border-flame-500" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="r-text" className="mb-1 block text-xs font-bold text-slate-600">القطعة المطلوبة *</label>
            <textarea id="r-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="مثال: ولاعة ريلو RS34، فونية 3.5 جالون..." className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-flame-500" />
            {err && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
          </div>
          <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-wa-dark font-bold text-white hover:brightness-110">
            <MessageCircle className="h-5 w-5" aria-hidden /> إرسال الطلب على واتساب
          </button>
        </form>
      </div>
    </section>
  );
}
