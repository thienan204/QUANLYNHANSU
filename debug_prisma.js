const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Prisma keys:', Object.keys(prisma));
    try {
        const employees = await prisma.nHANVIEN.findMany(); // Try existing working model
        console.log('Employees count:', employees.length);

        // Check if new models are accessible
        if (prisma.dANTOC) console.log('dANTOC exists');
        else console.log('dANTOC MISSING');

        if (prisma.danToc) console.log('danToc exists');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
