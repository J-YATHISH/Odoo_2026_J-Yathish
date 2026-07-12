import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promoteAll() {
    console.log("Promoting ALL users to ADMIN...");
    const employees = await prisma.employee.findMany({ include: { organization: true } });
    
    for (const employee of employees) {
        let adminRole = await prisma.role.findFirst({
            where: { name: 'ADMIN', organizationId: employee.organizationId }
        });
        
        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: 'ADMIN',
                    organizationId: employee.organizationId,
                    permissions: [
                        'MANAGE_ASSETS',
                        'VIEW_ASSETS',
                        'MANAGE_AUDITS',
                        'MANAGE_MAINTENANCE',
                        'VIEW_REPORTS',
                        'REQUEST_MAINTENANCE'
                    ]
                }
            });
        }
        
        await prisma.employee.update({
            where: { id: employee.id },
            data: { roleId: adminRole.id }
        });
        console.log(`Promoted ${employee.email} to ADMIN`);
    }
    console.log("Done!");
}

promoteAll().catch(console.error).finally(()=>prisma.$disconnect());
