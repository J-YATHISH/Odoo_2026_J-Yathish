import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database for seed data...");

  // 1. Create or find an Organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Acme Corp Seed' }
    });
    console.log("Created Organization:", org.name);
  }

  // 2. Create or find an Asset Category
  let category = await prisma.assetCategory.findFirst({ where: { organizationId: org.id } });
  if (!category) {
    category = await prisma.assetCategory.create({
      data: {
        organizationId: org.id,
        name: 'Laptop',
      }
    });
    console.log("Created Category:", category.name);
  }

  // 3. Create or find an Asset
  let asset = await prisma.asset.findFirst({ where: { organizationId: org.id } });
  if (!asset) {
    asset = await prisma.asset.create({
      data: {
        organizationId: org.id,
        tag: 'AF-SEED-001',
        name: 'MacBook Pro 2022',
        categoryId: category.id,
        status: 'AVAILABLE'
      }
    });
    console.log("Created Asset:", asset.name);
  }

  // 4. Create or find a Role
  let role = await prisma.role.findFirst({ where: { organizationId: org.id } });
  if (!role) {
    role = await prisma.role.create({
      data: {
        organizationId: org.id,
        name: 'Employee',
        permissions: []
      }
    });
    console.log("Created Role:", role.name);
  }

  // 5. Create or find an Employee
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash('Odoo@123', 10);
  
  let employee = await prisma.employee.findFirst({ where: { organizationId: org.id } });
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        organizationId: org.id,
        name: 'John Doe',
        email: 'john@seed.com',
        passwordHash: hash,
        roleId: role.id
      }
    });
    console.log("Created Employee:", employee.name);
  } else {
    // Update password to known value
    await prisma.employee.update({
        where: { id: employee.id },
        data: { passwordHash: hash }
    });
    console.log("Updated Employee Password");
  }

  // 5.5 Create an allocation so John owns the MacBook
  let allocation = await prisma.allocation.findFirst({ where: { holderId: employee.id, assetId: asset.id }});
  if (!allocation) {
      await prisma.allocation.create({
          data: {
              organizationId: org.id,
              assetId: asset.id,
              holderId: employee.id,
              isActive: true
          }
      });
      console.log("Created Allocation for John to MacBook");
  }

  // 6. Create Maintenance Requests (The data Colab is looking for!)
  const existingReqs = await prisma.maintenanceRequest.count();
  if (existingReqs === 0) {
    await prisma.maintenanceRequest.createMany({
      data: [
        {
          organizationId: org.id,
          assetId: asset.id,
          raisedById: employee.id,
          issueDescription: "My MacBook Pro screen is shattered after dropping it.",
          priority: "Unknown",
          issueCategory: "Unknown",
          aiAssessed: false
        },
        {
          organizationId: org.id,
          assetId: asset.id,
          raisedById: employee.id,
          issueDescription: "I need Microsoft Office installed on my PC.",
          priority: "Unknown",
          issueCategory: "Unknown",
          aiAssessed: false
        }
      ]
    });
    console.log("✅ Successfully seeded 2 Maintenance Requests into Supabase!");
  } else {
    console.log(`✅ Database already has ${existingReqs} Maintenance Requests.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
