import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: 'Starter',
        priceUsd: 0,
        trialDays: 0,
        limits: { submissions: 1000 },
        features: { captcha: true, webhooks: false, teamSeats: 2 },
        published: true
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
