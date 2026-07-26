export interface CultureCountry {
  code: string;
  name: string;
  color: string;
}

export const CULTURE_PALETTE = [
  "var(--color-cat-1)",
  "var(--color-cat-2)",
  "var(--color-cat-3)",
  "var(--color-cat-4)",
  "var(--color-cat-5)",
  "var(--color-cat-6)",
  "var(--color-cat-7)",
  "var(--color-cat-8)",
];

const COUNTRIES: Omit<CultureCountry, "color">[] = [
  { code: "US", name: "United States" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
];

export const CULTURE_COUNTRIES: CultureCountry[] = COUNTRIES.map(
  (country, i) => ({
    ...country,
    color: CULTURE_PALETTE[i % CULTURE_PALETTE.length],
  }),
);

const BY_CODE = new Map(CULTURE_COUNTRIES.map((c) => [c.code, c]));

export function getCultureCountry(code: string): CultureCountry | undefined {
  return BY_CODE.get(code);
}
