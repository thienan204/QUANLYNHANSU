
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://root:root@localhost:5432/humandkls?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        // 1. Seed new permission (trigger API logic essentially, but do it direct here)
        await prisma.pERMISSION.upsert({
            where: { code: 'MANAGE_MENU' },
            update: {},
            create: {
                code: 'MANAGE_MENU',
                name: 'Quản lý Menu (Builder)',
                module: 'Hệ thống'
            }
        });
        console.log("Permission seeded.");

        // 2. Update Menu Item
        const result = await prisma.menuItem.updateMany({
            where: { path: '/menu-builder' },
            data: { permissionCode: 'MANAGE_MENU' }
        });
        console.log(`Updated ${result.count} menu items to require MANAGE_MENU.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
