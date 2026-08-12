import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  CaseStatus,
  OperatorRole,
  OrderStatus,
  PrismaClient,
} from '../src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to verify the database.');
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function verify() {
  const operator = await prisma.operator.findUnique({
    where: { email: 'operator@local.test' },
  });
  assert(operator, 'The fixed development operator is missing.');
  assert.equal(
    operator.role,
    OperatorRole.OPERATOR,
    'The development operator must have the OPERATOR role.',
  );

  const manager = await prisma.operator.findUnique({
    where: { email: 'manager@local.test' },
  });
  assert(manager, 'The fixed development manager is missing.');
  assert.equal(
    manager.role,
    OperatorRole.MANAGER,
    'The development manager must have the MANAGER role.',
  );

  const orders = await prisma.order.findMany({
    where: {
      orderNumber: {
        in: [
          'ORD-1405-00125',
          'ORD-1405-00126',
          'ORD-1405-00127',
          'ORD-1405-00128',
        ],
      },
    },
    include: { customer: true, items: true },
  });

  assert.equal(orders.length, 4, 'Expected four development orders.');

  const deliveredOrder = orders.find(
    (order) => order.orderNumber === 'ORD-1405-00125',
  );
  assert(deliveredOrder, 'The delivered development order is missing.');
  assert.equal(deliveredOrder.status, OrderStatus.DELIVERED);
  assert.equal(deliveredOrder.items.length, 3);
  assert.equal(deliveredOrder.customer.customerCode, 'CUS-10021');

  const processingOrder = orders.find(
    (order) => order.orderNumber === 'ORD-1405-00126',
  );
  assert(processingOrder, 'The processing development order is missing.');
  assert.equal(processingOrder.status, OrderStatus.PROCESSING);

  const cleanDeliveredOrder = orders.find(
    (order) => order.orderNumber === 'ORD-1405-00127',
  );
  assert(cleanDeliveredOrder, 'The clean delivered order is missing.');
  assert.equal(cleanDeliveredOrder.status, OrderStatus.DELIVERED);
  assert.equal(cleanDeliveredOrder.items.length, 3);

  const cleanOrderItemIds = cleanDeliveredOrder.items.map((item) => item.id);
  const cleanOpenDiscrepancies = await prisma.openDiscrepancy.findMany({
    where: { orderItemId: { in: cleanOrderItemIds } },
  });
  assert.equal(
    cleanOpenDiscrepancies.length,
    0,
    'The clean demo order must not have any open discrepancies.',
  );

  const sampleCase = await prisma.discrepancyCase.findUnique({
    where: { caseNumber: 'CASE-1405-001' },
    include: { items: true, openDiscrepancies: true, history: true },
  });
  assert(sampleCase, 'The sample demo case (CASE-1405-001) is missing.');
  assert.equal(
    sampleCase.status,
    CaseStatus.SUBMITTED,
    'The sample demo case must be in SUBMITTED status.',
  );
  assert.equal(
    sampleCase.assigneeId,
    null,
    'The sample demo case must have no assignee.',
  );
  assert.equal(sampleCase.items.length, 1, 'Expected one discrepancy item.');
  assert.equal(
    sampleCase.openDiscrepancies.length,
    1,
    'Expected one open discrepancy.',
  );
  assert.equal(sampleCase.history.length, 1, 'Expected one history event.');

  await assert.rejects(
    prisma.$queryRawUnsafe(`SELECT 'INVALID_STATUS'::"OrderStatus"`),
    'PostgreSQL must reject invalid order status values.',
  );

  const constraints = await prisma.$queryRaw<Array<{ constraintName: string }>>`
    SELECT conname AS "constraintName"
    FROM pg_constraint
    WHERE conname IN (
      'order_delivered_at_matches_status',
      'order_item_delivered_quantity_positive',
      'discrepancy_item_quantity_positive',
      'decision_explanation_not_blank',
      'case_history_event_matches_status'
    )
  `;

  assert.equal(
    constraints.length,
    5,
    'Expected data integrity checks are missing.',
  );

  const [caseNumberSequence] = await prisma.$queryRaw<
    Array<{ exists: boolean }>
  >`
    SELECT to_regclass('public.discrepancy_case_number_seq') IS NOT NULL AS "exists"
  `;

  assert(
    caseNumberSequence?.exists,
    'The discrepancy case number sequence is missing.',
  );
}

verify()
  .then(() => {
    console.log('Database structure and development data are valid.');
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
