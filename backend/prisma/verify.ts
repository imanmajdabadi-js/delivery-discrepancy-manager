import 'dotenv/config';
import assert from 'node:assert/strict';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { OrderStatus, PrismaClient } from '../src/generated/prisma/client';

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

  const emptyDeliveredOrder = orders.find(
    (order) => order.orderNumber === 'ORD-1405-00127',
  );
  assert(emptyDeliveredOrder, 'The empty delivered order is missing.');
  assert.equal(emptyDeliveredOrder.status, OrderStatus.DELIVERED);
  assert.equal(emptyDeliveredOrder.items.length, 0);

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
