import { Cog, Droplets, Flame, Gauge, Layers, ShieldCheck, Wrench } from 'lucide-react';
import type { CategoryId } from '../types';

const ICONS = {
  burners: Flame,
  steam_valves: ShieldCheck,
  level_controls: Gauge,
  feed_pumps: Cog,
  steam_traps: Droplets,
  tubes_gaskets: Layers,
} as const;

export function CategoryIcon({ id, className }: { id: CategoryId | 'all'; className?: string }) {
  const Icon = id === 'all' ? Wrench : ICONS[id];
  return <Icon className={className} aria-hidden />;
}
