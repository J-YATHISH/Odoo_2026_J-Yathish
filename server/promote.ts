import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promote() {
    let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    
    if (!adminRole) {
        const org = await prisma.organization.findFirst();
        if (org) {
            adminRole = await prisma.role.create({
                data: {
                    name: 'ADMIN',
                    organizationId: org.id,
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
            console.log("Created ADMIN role");
        }
    }
    
    if (adminRole) {
        await prisma.employee.updateMany({ where: { email: 'john@seed.com' }, data: { roleId: adminRole.id } });
        console.log("Promoted John to ADMIN");
    }
}

promote().catch(console.error).finally(()=>prisma.$disconnect());
