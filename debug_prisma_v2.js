require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client...');
    try {
        // Check if new models existing on prisma instance
        const keys = Object.keys(prisma);
        // Note: prisma keys might not show models directly if they are getters, but we can try to access

        // Try to count DANTOC
        if (prisma.dANTOC) {
            const count = await prisma.dANTOC.count();
            console.log('DANTOC count:', count);
        } else if (prisma.danToc) {
            console.log('prisma.danToc exists');
        } else {
            console.log('DANTOC model NOT found on client instance');
        }

        // Try to fetch NHANVIEN with include
        const employees = await prisma.nHANVIEN.findMany({
            take: 1,
            include: {
                danTocRef: true
            }
        });
        console.log('Employees fetched:', employees.length);
        if (employees.length > 0) {
            console.log('Sample Name:', employees[0].hoTen);
            console.log('DanTocRef:', employees[0].danTocRef);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
