import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  AccessoryCategory,
  ContractStatus,
  OrderItemType,
  OrderStatus,
  ResourceStatus,
  ResourceType,
  Role,
  ServiceType,
} from '../src/generated/prisma/enums';

const adapter = new PrismaPg(process.env.DATABASE_URL ?? '');
const prisma = new PrismaClient({ adapter });

const BCRYPT_ROUNDS = 10;
const CLIENT_PASSWORD = 'Client123!';

type OrderSeed = {
  email: string;
  status: OrderStatus;
  daysAgo: number;
  items: { itemType: OrderItemType; itemName: string; quantity: number; priceAtPurchase: number }[];
};

async function ensureAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed: admin ${email} already exists, skipping.`);
    return;
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await prisma.user.create({
    data: { email, password: hash, role: Role.ADMIN },
  });
  console.log(`Seed: created admin ${email}`);
}

async function seedClients(): Promise<void> {
  const existing = await prisma.user.findFirst({ where: { role: Role.USER } });
  if (existing) {
    console.log('Seed: clients already exist, skipping.');
    return;
  }

  const hash = await bcrypt.hash(CLIENT_PASSWORD, BCRYPT_ROUNDS);
  const clients = [
    {
      email: 'sara.benali@telecom.local',
      firstName: 'Sara',
      lastName: 'Benali',
      phone: '+21620123456',
      birthDate: new Date('1992-03-15'),
      address: '12 Rue de la Liberté, Tunis',
    },
    {
      email: 'amine.trabelsi@telecom.local',
      firstName: 'Amine',
      lastName: 'Trabelsi',
      phone: '+21622111222',
      birthDate: new Date('1988-11-02'),
      address: '8 Avenue Habib Bourguiba, Sfax',
    },
    {
      email: 'yasmine.mansour@telecom.local',
      firstName: 'Yasmine',
      lastName: 'Mansour',
      phone: '+21625098765',
      birthDate: new Date('1995-07-25'),
      address: '5 Rue Ibn Khaldoun, Sousse',
    },
    {
      email: 'omar.haddad@telecom.local',
      firstName: 'Omar',
      lastName: 'Haddad',
      phone: '+21629001010',
      birthDate: new Date('1985-01-30'),
      address: '23 Rue Ali Belhouane, Bizerte',
    },
  ];

  for (const client of clients) {
    await prisma.user.create({
      data: { ...client, password: hash, role: Role.USER },
    });
  }
  console.log(`Seed: created ${clients.length} client users.`);
}

async function seedContracts(): Promise<void> {
  const existing = await prisma.contract.findFirst();
  if (existing) {
    console.log('Seed: contracts already exist, skipping.');
    return;
  }

  const clients = await prisma.user.findMany({
    where: { role: Role.USER },
    select: { email: true, id: true },
  });
  const byEmail = new Map(clients.map((c) => [c.email, c.id]));

  const contracts = [
    {
      email: 'sara.benali@telecom.local',
      type: 'Postpaid',
      status: ContractStatus.ACTIVE,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2026-01-14'),
    },
    {
      email: 'amine.trabelsi@telecom.local',
      type: 'Business',
      status: ContractStatus.ACTIVE,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2026-02-28'),
    },
    {
      email: 'yasmine.mansour@telecom.local',
      type: 'Prepaid',
      status: ContractStatus.ACTIVE,
      startDate: new Date('2025-05-20'),
      endDate: new Date('2026-05-19'),
    },
    {
      email: 'omar.haddad@telecom.local',
      type: 'IoT',
      status: ContractStatus.SUSPENDED,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-10-31'),
    },
    {
      email: 'amine.trabelsi@telecom.local',
      type: 'Data-only',
      status: ContractStatus.ACTIVE,
      startDate: new Date('2025-06-10'),
      endDate: new Date('2026-06-09'),
    },
  ];

  for (const contract of contracts) {
    const clientId = byEmail.get(contract.email);
    if (!clientId) continue;
    await prisma.contract.create({
      data: {
        clientId,
        type: contract.type,
        status: contract.status,
        startDate: contract.startDate,
        endDate: contract.endDate,
      },
    });
  }
  console.log(`Seed: created ${contracts.length} contracts.`);
}

async function seedResources(): Promise<void> {
  const existing = await prisma.resource.findFirst();
  if (existing) {
    console.log('Seed: resources already exist, skipping.');
    return;
  }

  const contracts = await prisma.contract.findMany({
    where: { status: { not: ContractStatus.TERMINATED } },
    select: { id: true, client: { select: { email: true } } },
  });
  const contractByClientEmail = new Map(
    contracts.map((c) => [c.client.email, c.id]),
  );

  const resources = [
    {
      type: ResourceType.SIM,
      iccid: '89441110000000000001',
      imsi: '250011000000001',
      msisdn: '+21620123456',
      status: ResourceStatus.ASSIGNED,
      email: 'sara.benali@telecom.local',
    },
    {
      type: ResourceType.ESIM,
      iccid: '89441110000000000002',
      imsi: '250011000000002',
      msisdn: '+21622111222',
      status: ResourceStatus.ASSIGNED,
      email: 'amine.trabelsi@telecom.local',
    },
    {
      type: ResourceType.SIM,
      iccid: '89441110000000000003',
      imsi: '250011000000003',
      msisdn: '+21625098765',
      status: ResourceStatus.ASSIGNED,
      email: 'yasmine.mansour@telecom.local',
    },
    {
      type: ResourceType.SIM,
      iccid: '89441110000000000004',
      imsi: '250011000000004',
      msisdn: '+21629112233',
      status: ResourceStatus.AVAILABLE,
      email: null,
    },
    {
      type: ResourceType.ESIM,
      iccid: '89441110000000000005',
      imsi: '250011000000005',
      msisdn: '+21629334455',
      status: ResourceStatus.AVAILABLE,
      email: null,
    },
    {
      type: ResourceType.SIM,
      iccid: '89441110000000000006',
      imsi: '250011000000006',
      msisdn: '+21629445566',
      status: ResourceStatus.BLOCKED,
      email: null,
    },
  ];

  for (const resource of resources) {
    const contractId = resource.email
      ? contractByClientEmail.get(resource.email)
      : undefined;
    await prisma.resource.create({
      data: {
        type: resource.type,
        iccid: resource.iccid,
        imsi: resource.imsi,
        msisdn: resource.msisdn,
        status: resource.status,
        contractId: contractId ?? null,
      },
    });
  }
  console.log(`Seed: created ${resources.length} resources.`);
}

async function seedServices(): Promise<void> {
  const existing = await prisma.service.findFirst();
  if (existing) {
    console.log('Seed: services already exist, skipping.');
    return;
  }

  const services = [
    {
      name: 'Unlimited 4G',
      type: ServiceType.INTERNET,
      description: 'Unlimited 4G data bundle for Tunisia',
      price: 29.99,
      isActive: true,
    },
    {
      name: 'International Roaming',
      type: ServiceType.ROAMING,
      description: 'Pay-as-you-go roaming in the EU',
      price: 9.99,
      isActive: true,
    },
    {
      name: 'HD Voice',
      type: ServiceType.VOLTE,
      description: 'HD voice over LTE for crystal-clear calls',
      price: 4.99,
      isActive: true,
    },
    {
      name: 'SMS 1000',
      type: ServiceType.SMS,
      description: '1000 SMS included per month',
      price: 7.99,
      isActive: false,
    },
    {
      name: 'Fiber Bundle Option',
      type: ServiceType.OPTION,
      description: 'Optional fiber internet bundle',
      price: 19.99,
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log(`Seed: created ${services.length} services.`);
}

async function seedAccessories(): Promise<void> {
  const existing = await prisma.accessory.findFirst();
  if (existing) {
    console.log('Seed: accessories already exist, skipping.');
    return;
  }

  const accessories = [
    {
      name: 'Galaxy S25 Case',
      category: AccessoryCategory.SMARTPHONE,
      price: 19.99,
      stockQuantity: 50,
    },
    {
      name: 'Fast Charger 65W',
      category: AccessoryCategory.CHARGER,
      price: 24.99,
      stockQuantity: 30,
    },
    {
      name: 'Wireless Headset',
      category: AccessoryCategory.HEADSET,
      price: 59.99,
      stockQuantity: 20,
    },
    {
      name: '4G LTE Modem',
      category: AccessoryCategory.MODEM,
      price: 89.99,
      stockQuantity: 15,
    },
  ];

  for (const accessory of accessories) {
    await prisma.accessory.create({ data: accessory });
  }
  console.log(`Seed: created ${accessories.length} accessories.`);
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

async function seedOrders(): Promise<void> {
  const existing = await prisma.order.findFirst();
  if (existing) {
    console.log('Seed: orders already exist, skipping.');
    return;
  }

  const clients = await prisma.user.findMany({
    where: { role: Role.USER },
    select: { email: true, id: true },
  });
  const byEmail = new Map(clients.map((c) => [c.email, c.id]));

  const orders: OrderSeed[] = [
    {
      email: 'sara.benali@telecom.local',
      status: OrderStatus.DELIVERED,
      daysAgo: 30,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Galaxy S25 Case',
          quantity: 2,
          priceAtPurchase: 19.99,
        },
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'Unlimited 4G',
          quantity: 1,
          priceAtPurchase: 29.99,
        },
      ],
    },
    {
      email: 'amine.trabelsi@telecom.local',
      status: OrderStatus.SHIPPED,
      daysAgo: 12,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: '4G LTE Modem',
          quantity: 1,
          priceAtPurchase: 89.99,
        },
      ],
    },
    {
      email: 'yasmine.mansour@telecom.local',
      status: OrderStatus.PROCESSING,
      daysAgo: 5,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Wireless Headset',
          quantity: 1,
          priceAtPurchase: 59.99,
        },
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Fast Charger 65W',
          quantity: 1,
          priceAtPurchase: 24.99,
        },
      ],
    },
    {
      email: 'omar.haddad@telecom.local',
      status: OrderStatus.PENDING,
      daysAgo: 2,
      items: [
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'International Roaming',
          quantity: 3,
          priceAtPurchase: 9.99,
        },
      ],
    },
    {
      email: 'sara.benali@telecom.local',
      status: OrderStatus.DELIVERED,
      daysAgo: 60,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Fast Charger 65W',
          quantity: 1,
          priceAtPurchase: 24.99,
        },
      ],
    },
    {
      email: 'amine.trabelsi@telecom.local',
      status: OrderStatus.CANCELLED,
      daysAgo: 45,
      items: [
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'Fiber Bundle Option',
          quantity: 1,
          priceAtPurchase: 19.99,
        },
      ],
    },
    {
      email: 'yasmine.mansour@telecom.local',
      status: OrderStatus.DELIVERED,
      daysAgo: 90,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Galaxy S25 Case',
          quantity: 1,
          priceAtPurchase: 19.99,
        },
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'HD Voice',
          quantity: 1,
          priceAtPurchase: 4.99,
        },
      ],
    },
    {
      email: 'sara.benali@telecom.local',
      status: OrderStatus.SHIPPED,
      daysAgo: 7,
      items: [
        {
          itemType: OrderItemType.RESOURCE,
          itemName: '4G LTE Modem',
          quantity: 1,
          priceAtPurchase: 89.99,
        },
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Fast Charger 65W',
          quantity: 2,
          priceAtPurchase: 24.99,
        },
      ],
    },
    {
      email: 'omar.haddad@telecom.local',
      status: OrderStatus.DELIVERED,
      daysAgo: 120,
      items: [
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'Unlimited 4G',
          quantity: 2,
          priceAtPurchase: 29.99,
        },
      ],
    },
    {
      email: 'amine.trabelsi@telecom.local',
      status: OrderStatus.PROCESSING,
      daysAgo: 3,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: 'Wireless Headset',
          quantity: 2,
          priceAtPurchase: 59.99,
        },
      ],
    },
    {
      email: 'sara.benali@telecom.local',
      status: OrderStatus.PENDING,
      daysAgo: 1,
      items: [
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'HD Voice',
          quantity: 1,
          priceAtPurchase: 4.99,
        },
        {
          itemType: OrderItemType.SERVICE,
          itemName: 'International Roaming',
          quantity: 1,
          priceAtPurchase: 9.99,
        },
      ],
    },
    {
      email: 'yasmine.mansour@telecom.local',
      status: OrderStatus.SHIPPED,
      daysAgo: 9,
      items: [
        {
          itemType: OrderItemType.ACCESSORY,
          itemName: '4G LTE Modem',
          quantity: 1,
          priceAtPurchase: 89.99,
        },
      ],
    },
  ];

  const now = Date.now();
  for (const order of orders) {
    const clientId = byEmail.get(order.email);
    if (!clientId) continue;

    const totalAmount = roundAmount(
      order.items.reduce(
        (sum, item) => sum + item.quantity * item.priceAtPurchase,
        0,
      ),
    );
    const createdAt = new Date(now - order.daysAgo * 24 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        clientId,
        status: order.status,
        totalAmount,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: order.items.map((item) => ({
            itemType: item.itemType,
            itemName: item.itemName,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
        },
      },
    });
  }
  console.log(`Seed: created ${orders.length} orders.`);
}

async function main(): Promise<void> {
  await ensureAdmin();
  await seedClients();
  await seedContracts();
  await seedResources();
  await seedServices();
  await seedAccessories();
  await seedOrders();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
