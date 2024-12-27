export interface CheckoutInput {
  couponCode?: string;
}

export interface PaymentData {
  transactionId: string;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  orderId: string;
  couponCode?: string;
  discountAmount?: number;
  cartId: string | null;
}

export interface VerifyCheckoutQuery {
  transactionId: string;
  orderId: string;
  cartId: string;
  status: string;
  customerName: string;
  amount: string;
}

