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

export type CaseDiscrepancyType = 'SHORTAGE' | 'DAMAGED';
export type CaseStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type CaseDecisionType = 'APPROVE' | 'REJECT';
export type CaseEventType = 'CREATED' | 'DECIDED';

export interface CreateCaseItemInput {
  orderItemId: string;
  type: CaseDiscrepancyType;
  quantity: number;
}

export interface CreateCaseRequest {
  orderId: string;
  items: CreateCaseItemInput[];
}

export interface CreateCaseResponse {
  id: string;
  caseNumber: string;
  status: 'SUBMITTED';
  createdAt: string;
}

export interface CaseActor {
  id: string;
  fullName: string;
}

export interface CaseDetailsResponse {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: CaseActor;
  order: {
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
  };
  items: Array<{
    id: string;
    type: CaseDiscrepancyType;
    quantity: number;
    orderItem: OrderSearchItem;
  }>;
  decision: {
    type: CaseDecisionType;
    explanation: string;
    createdAt: string;
    decidedBy: CaseActor;
  } | null;
  history: Array<{
    id: string;
    eventType: CaseEventType;
    resultingStatus: CaseStatus;
    createdAt: string;
    performedBy: CaseActor;
  }>;
}

export interface CaseValidationIssue {
  field: string;
  code: string;
  message: string;
  orderItemId?: string;
  type?: CaseDiscrepancyType;
}

export interface CaseConflict {
  orderItemId: string;
  type: CaseDiscrepancyType;
  caseNumber: string;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  errors?: CaseValidationIssue[];
  conflicts?: CaseConflict[];
}
