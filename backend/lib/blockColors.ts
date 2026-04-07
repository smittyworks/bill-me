export const BLOCK_PALETTE = [
  'sky',
  'violet',
  'rose',
  'amber',
  'emerald',
  'pink',
  'orange',
  'teal',
] as const;

export type BlockColor = (typeof BLOCK_PALETTE)[number];

/** Tailwind classes for each palette color. Fully static so Tailwind can detect them. */
export const blockColorClasses: Record<string, { bg: string; border: string }> = {
  sky:     { bg: 'bg-sky-100 dark:bg-sky-900/25',      border: 'border-sky-200 dark:border-sky-700' },
  violet:  { bg: 'bg-violet-100 dark:bg-violet-900/25', border: 'border-violet-200 dark:border-violet-700' },
  rose:    { bg: 'bg-rose-100 dark:bg-rose-900/25',    border: 'border-rose-200 dark:border-rose-700' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-900/25',  border: 'border-amber-200 dark:border-amber-700' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/25', border: 'border-emerald-200 dark:border-emerald-700' },
  pink:    { bg: 'bg-pink-100 dark:bg-pink-900/25',    border: 'border-pink-200 dark:border-pink-700' },
  orange:  { bg: 'bg-orange-100 dark:bg-orange-900/25', border: 'border-orange-200 dark:border-orange-700' },
  teal:    { bg: 'bg-teal-100 dark:bg-teal-900/25',    border: 'border-teal-200 dark:border-teal-700' },
};

export function pickNextColor(existingCount: number): string {
  return BLOCK_PALETTE[existingCount % BLOCK_PALETTE.length];
}
