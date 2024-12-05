export type TVendorOnboardingPayload = {
  vendor: {
    name: string;
    logo?: string;
    description?: string;
  };
  products: {
    name: string;
    description: string;
    price: number;
    categoryId?: string | null;
    vendorId: string;
    images: string[];
    inventoryCount: number;
    discount?: number | null;
    isFlashSale?: boolean;
    averageRating?: number;
  }[];
};
