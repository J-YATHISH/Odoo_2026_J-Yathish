import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function allocateToAll() {
    console.log("Allocating an asset to every employee so they can test Zero-Touch AI...");
    const employees = await prisma.employee.findMany();
    
    for (const employee of employees) {
        // Find or create an asset category
        let category = await prisma.assetCategory.findFirst({ where: { organizationId: employee.organizationId } });
        if (!category) {
            category = await prisma.assetCategory.create({
                data: { organizationId: employee.organizationId, name: 'Laptop' }
            });
        }
        
        // Find or create an asset for THIS specific employee
        const asset = await prisma.asset.create({
            data: {
                organizationId: employee.organizationId,
                categoryId: category.id,
                name: 'Test Laptop ' + employee.id,
                tag: 'TEST-' + Math.random().toString(36).substring(7),
                status: 'AVAILABLE'
            }
        });

        // Check if employee already has an allocation
        const existing = await prisma.allocation.findFirst({ where: { holderId: employee.id, isActive: true } });
        if (!existing) {
            await prisma.allocation.create({
                data: {
                    organizationId: employee.organizationId,
                    assetId: asset.id,
                    holderId: employee.id,
                    isActive: true
                }
            });
            console.log(`Allocated asset to ${employee.email}`);
        }
    }
    console.log("Done!");
}

allocateToAll().catch(console.error).finally(()=>prisma.$disconnect());
