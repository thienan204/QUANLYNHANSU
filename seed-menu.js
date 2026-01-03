
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://root:root@localhost:5432/humandkls?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        // Check if menu exists
        const count = await prisma.menuItem.count();
        if (count > 0) {
            console.log("Menu already seeded, skipping...");
            return;
        }

        console.log("Seeding menu...");

        const items = [
            { label: 'Dashboard', path: '/', icon: 'HomeOutlined', order: 1 },
            { label: 'Quản lý Nhân viên', path: '/nhan-vien', icon: 'UserOutlined', order: 2 },
            {
                label: 'Danh mục', path: '#', icon: 'AppstoreOutlined', order: 3,
                children: [
                    { label: 'Quản lý Giới tính', path: '/danh-muc/gioi-tinh', order: 1 },
                    { label: 'Quản lý Khoa Phòng', path: '/danh-muc/khoa-phong', order: 2 },
                    { label: 'Quản lý Chức Danh', path: '/danh-muc/chuc-danh', order: 3 },
                    { label: 'Quản lý Trình Độ', path: '/danh-muc/trinh-do', order: 4 },
                    { label: 'Quản lý Chức Vụ', path: '/danh-muc/chuc-vu', order: 5 },
                    { label: 'Quản lý Dân Tộc', path: '/danh-muc/dan-toc', order: 6 },
                    { label: 'Quản lý Hợp Đồng', path: '/danh-muc/hop-dong', order: 7 },
                    { label: 'Quản lý Chứng Chỉ', path: '/danh-muc/chung-chi-hanh-nghe', order: 8 },
                ]
            },
            { label: 'Báo cáo', path: '/bao-cao', icon: 'BarChartOutlined', order: 4 },
            { label: 'Quản lý User', path: '/quan-ly-user', icon: 'SafetyCertificateOutlined', order: 5 },
            { label: 'Quản lý Role', path: '/quan-ly-user/role', icon: 'LockOutlined', order: 6 },
            { label: 'Menu Builder', path: '/menu-builder', icon: 'ToolOutlined', order: 7 },
        ];

        for (const item of items) {
            const parent = await prisma.menuItem.create({
                data: {
                    label: item.label,
                    path: item.path,
                    icon: item.icon,
                    order: item.order
                }
            });

            if (item.children) {
                for (const child of item.children) {
                    await prisma.menuItem.create({
                        data: {
                            label: child.label,
                            path: child.path,
                            icon: child.icon, // might be undefined
                            order: child.order,
                            parentId: parent.id
                        }
                    });
                }
            }
        }

        console.log("Seeding done.");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
