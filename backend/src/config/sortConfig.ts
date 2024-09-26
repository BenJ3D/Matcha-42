// Liste des champs de tri valides pour advancedResearch
export const VALID_SORT_FIELDS = ['username', 'age', 'fame_rating', 'city_name'] as const;

// Type TypeScript pour les champs de tri
export type SortField = typeof VALID_SORT_FIELDS[number];

// Liste des ordres de tri valides
export const VALID_ORDER_VALUES = ['asc', 'desc'] as const;

// Type TypeScript pour les ordres de tri
export type SortOrder = typeof VALID_ORDER_VALUES[number];