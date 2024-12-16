export type TProductFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  category?: string | undefined;
  vendor?: string | undefined;
  isFlashSale?: string | undefined;
  maxPrice?: string | undefined;
  minPrice?: string | undefined;
};