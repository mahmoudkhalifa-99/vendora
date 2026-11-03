import { Minus, Plus } from 'lucide-react';

export function QtyStepper({
  value,
  onChange,
  min = 1,
  size = 'md',
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  size?: 'sm' | 'md';
  label: string;
}) {
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white" role="group" aria-label={label}>
      <button type="button" aria-label="زيادة الكمية" onClick={() => onChange(value + 1)} className={`${btn} grid place-items-center text-slate-600 hover:bg-slate-100`}>
        <Plus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value, 10) || min))}
        className={`${size === 'sm' ? 'h-8 w-11 text-sm' : 'h-10 w-14'} border-x border-slate-200 bg-transparent text-center font-bold tabular-nums outline-none`}
      />
      <button type="button" aria-label="تقليل الكمية" onClick={() => onChange(Math.max(min, value - 1))} className={`${btn} grid place-items-center text-slate-600 hover:bg-slate-100`}>
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
