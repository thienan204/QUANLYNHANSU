require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://root:root@localhost:5432/humandkls?schema=public";
console.log("Connecting with URL:", connectionString.replace(/:[^:]+@/, ':***@'));

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Prisma Client initialized.');
    const keys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.log('Available Model Properties:', keys);

    console.log('--- Checking gIOITINH ---');
    if (prisma.gIOITINH) {
        try {
            const count = await prisma.gIOITINH.count();
            console.log('gIOITINH count:', count);
        } catch (e) {
            console.log('gIOITINH error:', e.message);
        }
    } else {
        console.log('prisma.gIOITINH is undefined');
    }

    console.log('--- Checking GIOITINH ---');
    if (prisma.GIOITINH) {
        try {
            const count = await prisma.GIOITINH.count();
            console.log('GIOITINH count:', count);
        } catch (e) {
            console.log('GIOITINH error:', e.message);
        }
    } else {
        console.log('prisma.GIOITINH is undefined');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
