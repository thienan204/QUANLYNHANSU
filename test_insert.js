require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://root:root@localhost:5432/humandkls?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Testing access to KHOAPHONG...');

    // List keys again
    const keys = Object.keys(prisma).filter(k => !k.startsWith('_'));
    console.log('Prisma Keys:', keys);

    // Try to find
    try {
        const count = await prisma.kHOAPHONG.count();
        console.log('Current KHOAPHONG count:', count);
    } catch (e) {
        console.error('Count failed:', e.message);
    }

    // Try to insert a dummy one
    try {
        const testName = "Test Dept " + Date.now();
        const newItem = await prisma.kHOAPHONG.create({
            data: { tenKhoaPhong: testName }
        });
        console.log('Successfully created:', newItem);

        // Clean up
        await prisma.kHOAPHONG.delete({ where: { id: newItem.id } });
        console.log('Successfully cleaned up.');
    } catch (e) {
        console.error('Create failed:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
