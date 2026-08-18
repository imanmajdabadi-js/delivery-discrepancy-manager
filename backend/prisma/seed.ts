import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  OrderStatus,
  PrismaClient,
  OperatorRole,
} from '../src/generated/prisma/client';

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
  cleanDeliveredOrder: '33333333-3333-4333-8333-333333333333',
  cancelledOrder: '34444444-4444-4444-8444-444444444444',
  riceItem: '41111111-1111-4111-8111-111111111111',
  oilItem: '42222222-2222-4222-8222-222222222222',
  detergentItem: '43333333-3333-4333-8333-333333333333',
  processingItem: '44444444-4444-4444-8444-444444444444',
  cleanRiceItem: '55111111-1111-4111-8111-111111111111',
  cleanOilItem: '55222222-2222-4222-8222-222222222222',
  cleanDetergentItem: '55333333-3333-4333-8333-333333333333',
} as const;

async function seed() {
  await prisma.$transaction(async (transaction) => {
    await transaction.operator.upsert({
      where: { id: seedIds.operator },
      update: {
        fullName: 'کارشناس عملیات توسعه',
        email: 'operator@local.test',
        role: OperatorRole.OPERATOR,
        passwordHash:
          'd63fc9c28fff5bcac906b9f18e5427e6:483a7aab3f5f6bb2d15152a5d63ec72e4774815e2b7a7768c602667c6eb53104deb4aa65899aebf19cf8cdf99a054feed0b92c8752991205c3667ae881f2c07d',
      },
      create: {
        id: seedIds.operator,
        fullName: 'کارشناس عملیات توسعه',
        email: 'operator@local.test',
        role: OperatorRole.OPERATOR,
        passwordHash:
          'd63fc9c28fff5bcac906b9f18e5427e6:483a7aab3f5f6bb2d15152a5d63ec72e4774815e2b7a7768c602667c6eb53104deb4aa65899aebf19cf8cdf99a054feed0b92c8752991205c3667ae881f2c07d',
      },
    });

    await transaction.operator.upsert({
      where: { email: 'manager@local.test' },
      update: {
        fullName: 'مدیر عملیات توسعه',
        email: 'manager@local.test',
        role: OperatorRole.MANAGER,
        passwordHash:
          'd63fc9c28fff5bcac906b9f18e5427e6:483a7aab3f5f6bb2d15152a5d63ec72e4774815e2b7a7768c602667c6eb53104deb4aa65899aebf19cf8cdf99a054feed0b92c8752991205c3667ae881f2c07d',
      },
      create: {
        fullName: 'مدیر عملیات توسعه',
        email: 'manager@local.test',
        role: OperatorRole.MANAGER,
        passwordHash:
          'd63fc9c28fff5bcac906b9f18e5427e6:483a7aab3f5f6bb2d15152a5d63ec72e4774815e2b7a7768c602667c6eb53104deb4aa65899aebf19cf8cdf99a054feed0b92c8752991205c3667ae881f2c07d',
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
      where: { id: seedIds.cleanDeliveredOrder },
      update: {
        orderNumber: 'ORD-1405-00127',
        customerId: seedIds.customerRahimi,
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date('2026-07-14T11:15:00.000Z'),
      },
      create: {
        id: seedIds.cleanDeliveredOrder,
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

    await transaction.orderItem.upsert({
      where: { id: seedIds.cleanRiceItem },
      update: {
        orderId: seedIds.cleanDeliveredOrder,
        sku: 'SKU-RICE-10',
        productName: 'برنج ایرانی هاشمی ممتاز ده کیلویی',
        unit: 'کیسه',
        deliveredQuantity: 6,
      },
      create: {
        id: seedIds.cleanRiceItem,
        orderId: seedIds.cleanDeliveredOrder,
        sku: 'SKU-RICE-10',
        productName: 'برنج ایرانی هاشمی ممتاز ده کیلویی',
        unit: 'کیسه',
        deliveredQuantity: 6,
      },
    });

    await transaction.orderItem.upsert({
      where: { id: seedIds.cleanOilItem },
      update: {
        orderId: seedIds.cleanDeliveredOrder,
        sku: 'SKU-OIL-810',
        productName: 'روغن مایع آفتابگردان ۸۱۰ گرمی',
        unit: 'بطری',
        deliveredQuantity: 12,
      },
      create: {
        id: seedIds.cleanOilItem,
        orderId: seedIds.cleanDeliveredOrder,
        sku: 'SKU-OIL-810',
        productName: 'روغن مایع آفتابگردان ۸۱۰ گرمی',
        unit: 'بطری',
        deliveredQuantity: 12,
      },
    });

    await transaction.orderItem.upsert({
      where: { id: seedIds.cleanDetergentItem },
      update: {
        orderId: seedIds.cleanDeliveredOrder,
        sku: 'SKU-WASH-25',
        productName: 'مایع لباس‌شویی مخصوص لباس‌های رنگی دو و نیم لیتری',
        unit: 'بطری',
        deliveredQuantity: 8,
      },
      create: {
        id: seedIds.cleanDetergentItem,
        orderId: seedIds.cleanDeliveredOrder,
        sku: 'SKU-WASH-25',
        productName: 'مایع لباس‌شویی مخصوص لباس‌های رنگی دو و نیم لیتری',
        unit: 'بطری',
        deliveredQuantity: 8,
      },
    });

    const deliveredOrderItemIds = [
      seedIds.riceItem,
      seedIds.oilItem,
      seedIds.detergentItem,
    ];
    const cleanOrderItemIds = [
      seedIds.cleanRiceItem,
      seedIds.cleanOilItem,
      seedIds.cleanDetergentItem,
    ];

    const allDemoOrderItemIds = [
      ...deliveredOrderItemIds,
      ...cleanOrderItemIds,
    ];

    const demoOrderIds = [seedIds.deliveredOrder, seedIds.cleanDeliveredOrder];

    const demoCases = await transaction.discrepancyCase.findMany({
      where: {
        orderId: { in: demoOrderIds },
      },
      select: { id: true },
    });

    if (demoCases.length > 0) {
      const caseIds = demoCases.map((c) => c.id);
      await transaction.caseHistory.deleteMany({
        where: { caseId: { in: caseIds } },
      });
      await transaction.caseDecision.deleteMany({
        where: { caseId: { in: caseIds } },
      });
      await transaction.discrepancyItem.deleteMany({
        where: { caseId: { in: caseIds } },
      });
      await transaction.openDiscrepancy.deleteMany({
        where: { orderItemId: { in: allDemoOrderItemIds } },
      });
      await transaction.discrepancyCase.deleteMany({
        where: { id: { in: caseIds } },
      });
    }

    const sampleCaseId = '51111111-1111-4111-8111-111111111111';

    await transaction.discrepancyCase.create({
      data: {
        id: sampleCaseId,
        caseNumber: 'CASE-1405-001',
        orderId: seedIds.deliveredOrder,
        status: 'SUBMITTED',
        createdById: seedIds.operator,
        items: {
          create: [
            {
              orderItemId: seedIds.riceItem,
              type: 'SHORTAGE',
              quantity: 2,
            },
          ],
        },
        openDiscrepancies: {
          create: [
            {
              orderItemId: seedIds.riceItem,
              type: 'SHORTAGE',
            },
          ],
        },
        history: {
          create: [
            {
              eventType: 'CREATED',
              resultingStatus: 'SUBMITTED',
              performedById: seedIds.operator,
            },
          ],
        },
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
