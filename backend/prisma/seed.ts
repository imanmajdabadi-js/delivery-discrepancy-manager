import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { OrderStatus, PrismaClient } from '../src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const seedIds = {
  operator: '11111111-1111-4111-8111-111111111111',
  customerRahimi: '21111111-1111-4111-8111-111111111111',
  customerKarimi: '22222222-2222-4222-8222-222222222222',
  deliveredOrder: '31111111-1111-4111-8111-111111111111',
  processingOrder: '32222222-2222-4222-8222-222222222222',
  emptyDeliveredOrder: '33333333-3333-4333-8333-333333333333',
  cancelledOrder: '34444444-4444-4444-8444-444444444444',
  riceItem: '41111111-1111-4111-8111-111111111111',
  oilItem: '42222222-2222-4222-8222-222222222222',
  detergentItem: '43333333-3333-4333-8333-333333333333',
  processingItem: '44444444-4444-4444-8444-444444444444',
} as const;

async function seed() {
  await prisma.$transaction(async (transaction) => {
    await transaction.operator.upsert({
      where: { id: seedIds.operator },
      update: {
        fullName: 'کارشناس عملیات توسعه',
        email: 'operator@local.test',
      },
      create: {
        id: seedIds.operator,
        fullName: 'کارشناس عملیات توسعه',
        email: 'operator@local.test',
      },
    });

    await transaction.customer.upsert({
      where: { id: seedIds.customerRahimi },
      update: {
        customerCode: 'CUS-10021',
        fullName: 'فروشگاه زنجیره‌ای رحیمی',
        phone: '09121234567',
      },
      create: {
        id: seedIds.customerRahimi,
        customerCode: 'CUS-10021',
        fullName: 'فروشگاه زنجیره‌ای رحیمی',
        phone: '09121234567',
      },
    });

    await transaction.customer.upsert({
      where: { id: seedIds.customerKarimi },
      update: {
        customerCode: 'CUS-10022',
        fullName: 'سوپرمارکت کریمی',
        phone: '09351234567',
      },
      create: {
        id: seedIds.customerKarimi,
        customerCode: 'CUS-10022',
        fullName: 'سوپرمارکت کریمی',
        phone: '09351234567',
      },
    });

    await transaction.order.upsert({
      where: { id: seedIds.deliveredOrder },
      update: {
        orderNumber: 'ORD-1405-00125',
        customerId: seedIds.customerRahimi,
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date('2026-07-12T08:30:00.000Z'),
      },
      create: {
        id: seedIds.deliveredOrder,
        orderNumber: 'ORD-1405-00125',
        customerId: seedIds.customerRahimi,
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date('2026-07-12T08:30:00.000Z'),
      },
    });

    await transaction.order.upsert({
      where: { id: seedIds.processingOrder },
      update: {
        orderNumber: 'ORD-1405-00126',
        customerId: seedIds.customerKarimi,
        status: OrderStatus.PROCESSING,
        deliveredAt: null,
      },
      create: {
        id: seedIds.processingOrder,
        orderNumber: 'ORD-1405-00126',
        customerId: seedIds.customerKarimi,
        status: OrderStatus.PROCESSING,
      },
    });

    await transaction.order.upsert({
      where: { id: seedIds.emptyDeliveredOrder },
      update: {
        orderNumber: 'ORD-1405-00127',
        customerId: seedIds.customerRahimi,
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date('2026-07-14T11:15:00.000Z'),
      },
      create: {
        id: seedIds.emptyDeliveredOrder,
        orderNumber: 'ORD-1405-00127',
        customerId: seedIds.customerRahimi,
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date('2026-07-14T11:15:00.000Z'),
      },
    });

    await transaction.order.upsert({
      where: { id: seedIds.cancelledOrder },
      update: {
        orderNumber: 'ORD-1405-00128',
        customerId: seedIds.customerKarimi,
        status: OrderStatus.CANCELLED,
        deliveredAt: null,
      },
      create: {
        id: seedIds.cancelledOrder,
        orderNumber: 'ORD-1405-00128',
        customerId: seedIds.customerKarimi,
        status: OrderStatus.CANCELLED,
      },
    });

    await transaction.orderItem.upsert({
      where: { id: seedIds.riceItem },
      update: {
        orderId: seedIds.deliveredOrder,
        sku: 'SKU-RICE-10',
        productName: 'برنج ایرانی هاشمی ممتاز ده کیلویی',
        unit: 'کیسه',
        deliveredQuantity: 6,
      },
      create: {
        id: seedIds.riceItem,
        orderId: seedIds.deliveredOrder,
        sku: 'SKU-RICE-10',
        productName: 'برنج ایرانی هاشمی ممتاز ده کیلویی',
        unit: 'کیسه',
        deliveredQuantity: 6,
      },
    });

    await transaction.orderItem.upsert({
      where: { id: seedIds.oilItem },
      update: {
        orderId: seedIds.deliveredOrder,
        sku: 'SKU-OIL-810',
        productName: 'روغن مایع آفتابگردان ۸۱۰ گرمی',
        unit: 'بطری',
        deliveredQuantity: 12,
      },
      create: {
        id: seedIds.oilItem,
        orderId: seedIds.deliveredOrder,
        sku: 'SKU-OIL-810',
        productName: 'روغن مایع آفتابگردان ۸۱۰ گرمی',
        unit: 'بطری',
        deliveredQuantity: 12,
      },
    });

    await transaction.orderItem.upsert({
      where: { id: seedIds.detergentItem },
      update: {
        orderId: seedIds.deliveredOrder,
        sku: 'SKU-WASH-25',
        productName: 'مایع لباس‌شویی مخصوص لباس‌های رنگی دو و نیم لیتری',
        unit: 'بطری',
        deliveredQuantity: 8,
      },
      create: {
        id: seedIds.detergentItem,
        orderId: seedIds.deliveredOrder,
        sku: 'SKU-WASH-25',
        productName: 'مایع لباس‌شویی مخصوص لباس‌های رنگی دو و نیم لیتری',
        unit: 'بطری',
        deliveredQuantity: 8,
      },
    });

    await transaction.orderItem.upsert({
      where: { id: seedIds.processingItem },
      update: {
        orderId: seedIds.processingOrder,
        sku: 'SKU-TEA-500',
        productName: 'چای سیاه ممتاز پانصد گرمی',
        unit: 'بسته',
        deliveredQuantity: 4,
      },
      create: {
        id: seedIds.processingItem,
        orderId: seedIds.processingOrder,
        sku: 'SKU-TEA-500',
        productName: 'چای سیاه ممتاز پانصد گرمی',
        unit: 'بسته',
        deliveredQuantity: 4,
      },
    });
  });
}

seed()
  .then(() => {
    console.log('Development data is ready.');
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
