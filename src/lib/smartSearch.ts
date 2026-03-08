import type { Collection, Product } from "@/data/products";

export type SearchSuggestion = {
  kind: "product" | "collection" | "material" | "category";
  label: string;
  value: string;
  score: number;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
};

export const inferProductCategory = (productName: string): string => {
  const name = normalize(productName);
  const rules: Array<{ category: string; keywords: string[] }> = [
    { category: "Table", keywords: ["table", "desk"] },
    { category: "Seating", keywords: ["chair", "sofa", "bench", "stool"] },
    { category: "Storage", keywords: ["shelf", "cabinet", "console"] },
    { category: "Lounge", keywords: ["daybed", "lounge", "ottoman"] },
    { category: "Accent", keywords: ["side table", "accent"] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => name.includes(keyword))) {
      return rule.category;
    }
  }
  return "Furniture";
};

export const scoreSearchCandidate = (query: string, candidate: string): number => {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return 0;

  if (c.includes(q)) {
    return 120 - c.indexOf(q);
  }

  const qTokens = q.split(" ").filter(Boolean);
  const cTokens = c.split(" ").filter(Boolean);
  let score = 0;

  for (const qToken of qTokens) {
    for (const cToken of cTokens) {
      if (cToken.startsWith(qToken)) {
        score += 24;
        continue;
      }
      const tolerance = qToken.length <= 4 ? 1 : 2;
      const distance = levenshtein(qToken, cToken);
      if (distance <= tolerance) {
        score += 18 - distance * 4;
      }
    }
  }

  return score;
};

export const matchesSmartSearch = (query: string, candidate: string): boolean =>
  scoreSearchCandidate(query, candidate) > 0;

export const buildSearchSuggestions = ({
  query,
  products,
  collections,
  materials,
  categories,
}: {
  query: string;
  products: Product[];
  collections: Collection[];
  materials: string[];
  categories: string[];
}): SearchSuggestion[] => {
  const q = normalize(query);
  if (!q) return [];

  const suggestions: SearchSuggestion[] = [
    ...products.map((product) => ({
      kind: "product" as const,
      label: product.name,
      value: product.name,
      score: scoreSearchCandidate(q, `${product.name} ${product.description} ${product.materials.join(" ")}`),
    })),
    ...collections.map((collection) => ({
      kind: "collection" as const,
      label: collection.name,
      value: collection.slug,
      score: scoreSearchCandidate(q, `${collection.name} ${collection.tagline} ${collection.description}`),
    })),
    ...materials.map((material) => ({
      kind: "material" as const,
      label: material,
      value: material,
      score: scoreSearchCandidate(q, material),
    })),
    ...categories.map((category) => ({
      kind: "category" as const,
      label: category,
      value: category,
      score: scoreSearchCandidate(q, category),
    })),
  ]
    .filter((suggestion) => suggestion.score > 0)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const deduped: SearchSuggestion[] = [];
  for (const suggestion of suggestions) {
    const key = `${suggestion.kind}:${suggestion.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(suggestion);
    if (deduped.length >= 8) break;
  }
  return deduped;
};

