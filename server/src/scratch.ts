import prisma from './prisma/client';
import { calculateAssetIntelligence, getGlobalBenchmarks } from './modules/intelligence/service';

async function verifyDynamicIntelligence() {
  console.log('--- STARTING MANUAL VERIFICATION OF INTELLIGENCE ENGINE ---');

  // 1. Clean DB (for a fresh test)
  await prisma.assetIntelligence.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.role.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Create Dynamic Test Data
  console.log('Creating Organization, Employee, and Category...');
  const org = await prisma.organization.create({ data: { name: 'TechCorp ' + Date.now() } });

  const role = await prisma.role.create({
    data: { name: 'Admin', organizationId: org.id, permissions: ['MANAGE_MAINTENANCE'] },
  });

  await prisma.employee.create({
    data: {
      organizationId: org.id,
      name: 'System Admin',
      email: 'admin@techcorp.com',
      passwordHash: 'hashed',
      roleId: role.id,
    },
  });

  const category = await prisma.assetCategory.create({
    data: {
      organizationId: org.id,
      name: 'High-Power Laptop',
      expectedLifespanMonths: 36, // 3 years
      baseCarbonFootprintKg: 150.0,
      powerDrawWatts: 65.0,
    },
  });

  // Create an old asset (6 years old) that SHOULD trigger the 85% threshold
  const acquisitionDate = new Date();
  acquisitionDate.setFullYear(acquisitionDate.getFullYear() - 6); // 72 months old

  console.log('Creating 6-year-old Asset...');
  const asset = await prisma.asset.create({
    data: {
      organizationId: org.id,
      tag: 'LAP-001',
      name: 'MacBook Pro 2022',
      categoryId: category.id,
      acquisitionDate,
      status: 'AVAILABLE',
    },
  });

  // 3. Run the Engine
  console.log('\nRunning Eco-Predictive Engine (calculateAssetIntelligence)...');
  const result = await calculateAssetIntelligence();
  console.log('Engine Result:', result);

  // 4. Verify DB State
  console.log('\nVerifying Database State...');
  const intelligence = await prisma.assetIntelligence.findUnique({ where: { assetId: asset.id } });
  console.log('Generated Intelligence Record:', intelligence);

  const maintenance = await prisma.maintenanceRequest.findMany({ where: { assetId: asset.id } });
  console.log(`Autonomous Maintenance Requests Generated: ${maintenance.length}`);
  if (maintenance.length > 0) {
    console.log('Maintenance Description:', maintenance[0].issueDescription);
    console.log('Maintenance Priority:', maintenance[0].priority);
  }

  // 5. Test Benchmarking
  console.log('\nTesting SQL Benchmarking Engine...');
  const benchmarks = await getGlobalBenchmarks(org.id);
  console.log('Benchmarks:', JSON.stringify(benchmarks, null, 2));

  console.log('\n--- VERIFICATION COMPLETE ---');
}

verifyDynamicIntelligence()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
