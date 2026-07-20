export type OrderStatus = 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export type OrderEligibilityReason = 'NOT_DELIVERED' | 'NO_ITEMS';

export interface OrderSearchItem {
  id: string;
  sku: string;
  productName: string;
  unit: string;
  deliveredQuantity: number;
}

export interface OrderSearchResult {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveredAt: string | null;
  customer: {
    id: string;
    customerCode: string;
    fullName: string;
    phone: string;
  };
  items: OrderSearchItem[];
  eligibility: {
    eligible: boolean;
    reason: OrderEligibilityReason | null;
  };
}

export interface OrderSearchResponse {
  query: string;
  results: OrderSearchResult[];
}
