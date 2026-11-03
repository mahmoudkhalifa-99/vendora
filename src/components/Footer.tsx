import { Flame, MapPin, MessageCircle, Phone } from 'lucide-react';
import { STORE } from '../config';
import { waLink } from '../lib/whatsapp';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-flame-500"><Flame className="h-6 w-6" aria-hidden /></span>
            <span className="font-extrabold">{STORE.name}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">{STORE.tagline}. توريد قطع غيار أصلية للمصانع والمنشآت الصناعية.</p>
        </div>
        <div className="space-y-2 text-sm">
          <h3 className="font-bold text-white">تواصل معنا</h3>
          <a href={`tel:${STORE.phoneLocal}`} className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-flame-400" aria-hidden /><span dir="ltr">{STORE.phoneDisplay}</span></a>
          <a href={waLink('السلام عليكم، عايز أستفسر عن قطع غيار الغلايات.')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><MessageCircle className="h-4 w-4 text-wa" aria-hidden />واتساب</a>
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame-400" aria-hidden />{STORE.address}</p>
        </div>
        <div className="text-sm">
          <h3 className="font-bold text-white">روابط سريعة</h3>
          <ul className="mt-2 space-y-1.5">
            <li><a href="#catalog" className="hover:text-white">كتالوج القطع</a></li>
            <li><a href="#custom" className="hover:text-white">طلب قطعة خاصة</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} {STORE.name}. جميع الحقوق محفوظة.</div>
    </footer>
  );
}
