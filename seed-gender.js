require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const genders = ['Nam', 'Nữ'];

    for (const g of genders) {
        const exists = await prisma.gIOITINH.findUnique({
            where: { tenGioiTinh: g },
        });

        if (!exists) {
            await prisma.gIOITINH.create({
                data: { tenGioiTinh: g },
            });
            console.log(`Created gender: ${g}`);
        } else {
            console.log(`Gender ${g} already exists`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
