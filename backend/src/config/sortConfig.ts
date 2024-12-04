export const VALID_SORT_FIELDS = ['username', 'age', 'fame_rating', 'city_name'] as const;

export type SortField = typeof VALID_SORT_FIELDS[number];

export const VALID_ORDER_VALUES = ['asc', 'desc'] as const;

export type SortOrder = typeof VALID_ORDER_VALUES[number];