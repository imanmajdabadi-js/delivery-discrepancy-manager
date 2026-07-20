export type CaseDiscrepancyType = 'SHORTAGE' | 'DAMAGED';

export interface CreateCaseItemInput {
  orderItemId: string;
  type: CaseDiscrepancyType;
  quantity: number;
}

export interface CreateCaseInput {
  orderId: string;
  items: CreateCaseItemInput[];
}

export interface CaseValidationIssue {
  field: string;
  code: string;
  message: string;
  orderItemId?: string;
  type?: CaseDiscrepancyType;
}

interface ParseResult {
  value: CreateCaseInput | null;
  issues: CaseValidationIssue[];
}

interface OrderItemSnapshot {
  id: string;
  deliveredQuantity: number;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDiscrepancyType(value: unknown): value is CaseDiscrepancyType {
  return value === 'SHORTAGE' || value === 'DAMAGED';
}

export function parseCreateCaseInput(input: unknown): ParseResult {
  if (!isRecord(input)) {
    return {
      value: null,
      issues: [
        {
          field: 'body',
          code: 'INVALID_BODY',
          message: 'اطلاعات پرونده ساختار معتبری ندارد.',
        },
      ],
    };
  }

  const issues: CaseValidationIssue[] = [];
  const orderId = input.orderId;
  const rawItems = input.items;

  if (typeof orderId !== 'string' || !uuidPattern.test(orderId)) {
    issues.push({
      field: 'orderId',
      code: 'INVALID_ORDER_ID',
      message: 'شناسه سفارش معتبر نیست.',
    });
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    issues.push({
      field: 'items',
      code: 'ITEMS_REQUIRED',
      message: 'حداقل یک قلم مغایرت انتخاب کنید.',
    });
  }

  const items: CreateCaseItemInput[] = [];

  if (Array.isArray(rawItems)) {
    rawItems.forEach((rawItem, index) => {
      if (!isRecord(rawItem)) {
        issues.push({
          field: `items.${index}`,
          code: 'INVALID_ITEM',
          message: 'اطلاعات این قلم معتبر نیست.',
        });
        return;
      }

      const orderItemId = rawItem.orderItemId;
      const type = rawItem.type;
      const quantity = rawItem.quantity;
      let itemIsValid = true;

      if (typeof orderItemId !== 'string' || !uuidPattern.test(orderItemId)) {
        issues.push({
          field: `items.${index}.orderItemId`,
          code: 'INVALID_ORDER_ITEM_ID',
          message: 'شناسه قلم سفارش معتبر نیست.',
        });
        itemIsValid = false;
      }

      if (!isDiscrepancyType(type)) {
        issues.push({
          field: `items.${index}.type`,
          code: 'INVALID_DISCREPANCY_TYPE',
          message: 'نوع مغایرت معتبر نیست.',
        });
        itemIsValid = false;
      }

      if (!Number.isInteger(quantity) || Number(quantity) <= 0) {
        issues.push({
          field: `items.${index}.quantity`,
          code: 'INVALID_QUANTITY',
          message: 'مقدار مغایرت باید یک عدد صحیح بزرگ‌تر از صفر باشد.',
          orderItemId:
            typeof orderItemId === 'string' ? orderItemId : undefined,
          type: isDiscrepancyType(type) ? type : undefined,
        });
        itemIsValid = false;
      }

      if (
        itemIsValid &&
        typeof orderItemId === 'string' &&
        isDiscrepancyType(type) &&
        typeof quantity === 'number'
      ) {
        items.push({ orderItemId, type, quantity });
      }
    });
  }

  const seenCombinations = new Set<string>();

  items.forEach((item, index) => {
    const key = `${item.orderItemId}:${item.type}`;

    if (seenCombinations.has(key)) {
      issues.push({
        field: `items.${index}.type`,
        code: 'DUPLICATE_ITEM_TYPE',
        message: 'این نوع مغایرت برای قلم انتخاب‌شده تکراری است.',
        orderItemId: item.orderItemId,
        type: item.type,
      });
    }

    seenCombinations.add(key);
  });

  return {
    value:
      issues.length === 0 && typeof orderId === 'string'
        ? { orderId, items }
        : null,
    issues,
  };
}

export function validateCaseItemsAgainstOrder(
  items: CreateCaseItemInput[],
  orderItems: OrderItemSnapshot[],
) {
  const issues: CaseValidationIssue[] = [];
  const orderItemMap = new Map(orderItems.map((item) => [item.id, item]));
  const totals = new Map<string, number>();

  items.forEach((item, index) => {
    const orderItem = orderItemMap.get(item.orderItemId);

    if (!orderItem) {
      issues.push({
        field: `items.${index}.orderItemId`,
        code: 'ITEM_NOT_IN_ORDER',
        message: 'قلم انتخاب‌شده متعلق به این سفارش نیست.',
        orderItemId: item.orderItemId,
        type: item.type,
      });
      return;
    }

    if (item.quantity > orderItem.deliveredQuantity) {
      issues.push({
        field: `items.${index}.quantity`,
        code: 'QUANTITY_EXCEEDS_DELIVERED',
        message: 'مقدار مغایرت از مقدار تحویل‌شده بیشتر است.',
        orderItemId: item.orderItemId,
        type: item.type,
      });
    }

    totals.set(
      item.orderItemId,
      (totals.get(item.orderItemId) ?? 0) + item.quantity,
    );
  });

  totals.forEach((total, orderItemId) => {
    const orderItem = orderItemMap.get(orderItemId);

    if (orderItem && total > orderItem.deliveredQuantity) {
      issues.push({
        field: 'items',
        code: 'TOTAL_QUANTITY_EXCEEDS_DELIVERED',
        message: 'مجموع کسری و آسیب‌دیدگی از مقدار تحویل‌شده بیشتر است.',
        orderItemId,
      });
    }
  });

  return issues;
}
