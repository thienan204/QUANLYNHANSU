
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://root:root@localhost:5432/humandkls?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const backupDir = path.join(__dirname, 'data_backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const models = [
        'nHANVIEN',
        'gIOITINH',
        'kHOAPHONG',
        'cHUCDANH',
        'tRINHDO',
        'cHUCVU',
        'dANTOC',
        'hOPDONG',
        'cHUNGCHIHANHNGHE',
        'rOLE',
        'pERMISSION',
        'user',
        'formConfig',
        'nhanVienKiemNhiem',
        'menuItem'
    ];

    console.log("Starting export...");

    for (const modelName of models) {
        try {
            // Prisma client model names lowerCamelCase usually matches unless mapped weirdly?
            // schema: NHANVIEN, client: nHANVIEN
            // Let's verify standard prisma naming. usually it creates camelCase properties on prisma instance.
            // schema: NHANVIEN -> prisma.nHANVIEN
            // schema: GIOITINH -> prisma.gIOITINH
            // schema: User -> prisma.user
            // schema: FormConfig -> prisma.formConfig

            if (!prisma[modelName]) {
                console.warn(`Model ${modelName} not found on prisma client instance! Skipping.`);
                continue;
            }

            const data = await prisma[modelName].findMany();
            const filePath = path.join(backupDir, `${modelName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`Exported ${modelName}: ${data.length} records`);
        } catch (e) {
            console.error(`Error exporting ${modelName}:`, e);
        }
    }

    console.log("Export completed.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
