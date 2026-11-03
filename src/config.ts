import type { CategoryId } from './types';

/** عدّل البيانات دي بس لتغيير هوية الموقع. */
export const STORE = {
  name: 'المصرية الهندسية',
  tagline: 'قطع غيار ومهمات الغلايات البخارية',
  /** رقم الواتساب بالصيغة الدولية بدون + أو أصفار (01065019364 → 201065019364) */
  whatsappNumber: '201065019364',
  phoneDisplay: '0106 501 9364',
  phoneLocal: '01065019364',
  address: 'المنطقة الصناعية، العاشر من رمضان / السادس من أكتوبر',
  currency: 'جنيه',
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'burners', label: 'ولاعات الغلايات وقطعها' },
  { id: 'steam_valves', label: 'صمامات ومحابس البخار والأمان' },
  { id: 'level_controls', label: 'أجهزة المستوى والضغط' },
  { id: 'feed_pumps', label: 'طلمبات التغذية' },
  { id: 'steam_traps', label: 'مصائد البخار' },
  { id: 'tubes_gaskets', label: 'مواسير وجوانات وعوازل' },
];
