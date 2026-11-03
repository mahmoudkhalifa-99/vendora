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
  /** رابط صورة حقيقية للمنتج (اختياري). لو فاضي بتظهر أيقونة القسم. */
  image?: string;
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
