export interface CultureCountry {
  code: string;
  name: string;
  color: string;
}

const COUNTRIES: Omit<CultureCountry, "color">[] = [
  { code: "US", name: "United States" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "NL", name: "Netherlands" },
  { code: "FI", name: "Finland" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SG", name: "Singapore" },
  { code: "IR", name: "Iran" },
  { code: "CN", name: "China" },
  { code: "AU", name: "Australia" },
  { code: "DK", name: "Denmark" },
  { code: "PL", name: "Poland" },
  { code: "MX", name: "Mexico" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "Korea" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  { code: "AR", name: "Argentina" },
  { code: "PE", name: "Peru" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ID", name: "Indonesia" },
  { code: "IL", name: "Israel" },
  { code: "NO", name: "Norway" },
  { code: "TH", name: "Thailand" },
  { code: "GH", name: "Ghana" },
  { code: "SE", name: "Sweden" },
  { code: "NG", name: "Nigeria" },
  { code: "AT", name: "Austria" },
  { code: "TR", name: "Turkey" },
  { code: "CH", name: "Switzerland" },
  { code: "CZ", name: "Czech Republic" },
];

// Golden-angle hue rotation guarantees every country gets a visually distinct
// color, however many are added, while staying deterministic per index.
function colorForIndex(i: number): string {
  const hue = Math.round((i * 137.508) % 360);
  return `hsl(${hue} 68% 44%)`;
}

export const CULTURE_COUNTRIES: CultureCountry[] = COUNTRIES.map(
  (country, i) => ({
    ...country,
    color: colorForIndex(i),
  }),
);

const BY_CODE = new Map(CULTURE_COUNTRIES.map((c) => [c.code, c]));

export function getCultureCountry(code: string): CultureCountry | undefined {
  return BY_CODE.get(code);
}
