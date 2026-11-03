export const fmt = (n: number) => n.toLocaleString('en-US');

/** توحيد النص العربي للبحث: يشيل التشكيل ويوحّد الألف والياء والتاء المربوطة */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
