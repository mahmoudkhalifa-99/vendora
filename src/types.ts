export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  price: number; // جنيه مصري
  unit: 'قطعة' | 'متر';
  category: CategoryId;
  partNumber?: string;
  brand?: string;
  pressureRating?: string;
  connectionSize?: string;
  temperatureMax?: string;
  boilerCompatibility?: string;
  originCountry?: string;
  technicalNotes?: string;
  /** صور المنتج (روابط أو data URL). الأولى هي الرئيسية. لو فاضية بتظهر أيقونة القسم. */
  images?: string[];
  /** false = مخفي عن الزوار */
  active?: boolean;
  /** ترتيب العرض (الأصغر أولاً) */
  sortIndex?: number;
}

export type CategoryId =
  | 'burners'
  | 'steam_valves'
  | 'level_controls'
  | 'feed_pumps'
  | 'steam_traps'
  | 'tubes_gaskets';

export interface CartLine {
  id: string;
  qty: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  company: string;
  city: string;
  notes: string;
}
