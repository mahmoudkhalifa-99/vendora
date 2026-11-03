/** يصغّر الصورة ويحوّلها WebP/JPEG صغيرة الحجم عشان تتخزن مباشرة مع بيانات القطعة */
export function compressImage(file: File, maxSide = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('الملف ده مش صورة'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('المتصفح لا يدعم معالجة الصور'));
      ctx.fillStyle = '#fff'; // خلفية بيضاء للصور الشفافة
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      let out = canvas.toDataURL('image/webp', quality);
      if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', quality);
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذّر قراءة الصورة'));
    };
    img.src = url;
  });
}
