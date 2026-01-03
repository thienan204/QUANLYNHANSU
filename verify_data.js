
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://root:root@localhost:5432/humandkls?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const count = await prisma.nHANVIEN.count();
        console.log(`Total NHANVIEN records: ${count}`);

        if (count > 0) {
            const first = await prisma.nHANVIEN.findFirst({
                include: {
                    kiemNhiem: true
                }
            });
            console.log('First record:', JSON.stringify(first, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
