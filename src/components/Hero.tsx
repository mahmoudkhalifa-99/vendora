import { BadgeCheck, MessageCircle, ShoppingCart, Truck } from 'lucide-react';
import { STORE } from '../config';

const STEPS = [
  { icon: ShoppingCart, title: 'اختار القطع', text: 'تصفّح الأقسام وأضف اللي محتاجه للسلة.' },
  { icon: BadgeCheck, title: 'راجع طلبك', text: 'عدّل الكميات واكتب بياناتك وملاحظاتك.' },
  { icon: MessageCircle, title: 'إتمام الشراء', text: 'الطلب كامل يوصلنا على واتساب ونؤكد السعر والتوفر.' },
];

export function Hero() {
  return (
    <section id="top" className="blueprint relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-flame-500/20 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-flame-400">
            <Truck className="h-3.5 w-3.5" aria-hidden /> توريد لجميع المصانع والمناطق الصناعية
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
            قطع غيار الغلايات البخارية
            <span className="block text-flame-400">بأعلى جودة وأسرع توريد</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            ولاعات، صمامات أمان، أجهزة تحكم، طلمبات تغذية ومصائد بخار من أشهر الماركات العالمية. اختار طلبك وأرسله مباشرة على واتساب.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#catalog" className="rounded-xl bg-flame-600 px-6 py-3 font-bold shadow-lg hover:bg-flame-700">تصفّح القطع</a>
            <a href="#custom" className="rounded-xl border border-white/20 px-6 py-3 font-bold hover:bg-white/10">مش لاقي القطعة؟ اطلبها</a>
          </div>
          <p className="mt-4 text-sm text-slate-400">للاستفسار: <a dir="ltr" href={`tel:${STORE.phoneLocal}`} className="font-bold text-white">{STORE.phoneDisplay}</a></p>
        </div>

        <ol className="mt-10 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-flame-500/20 text-flame-400">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-bold">{i + 1}. {s.title}</h2>
                <p className="mt-0.5 text-sm text-slate-300">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
