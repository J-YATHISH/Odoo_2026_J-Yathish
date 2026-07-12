import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkJohn() {
    const john = await prisma.employee.findUnique({
        where: { email: 'john@seed.com' },
        include: { role: true }
    });
    console.log("John's Role:", john?.role?.name);
    console.log("John's Permissions:", john?.role?.permissions);
}
checkJohn().catch(console.error).finally(()=>prisma.$disconnect());
