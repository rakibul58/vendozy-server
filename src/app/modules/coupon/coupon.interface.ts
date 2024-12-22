import { DiscountType } from "@prisma/client";

export type TCouponPayload = {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  minPurchase?: number;
  isActive?: boolean;
};

export type TCouponFilterRequest = {
  searchTerm?: string | undefined;
  code?: string | undefined;
  discountType?: DiscountType | undefined;
  isActive?: string | undefined;
  validNow?: string | undefined;
};
