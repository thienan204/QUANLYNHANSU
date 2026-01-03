import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.pERMISSION.findMany({
            orderBy: { module: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error(error);
        return new NextResponse("Lỗi tải danh sách Permission", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Init default permissions
        const permissions = [
            // Module Nhân sự
            { code: "VIEW_EMPLOYEE", name: "Xem danh sách nhân viên", module: "Quản lý Nhân sự" },
            { code: "CREATE_EMPLOYEE", name: "Thêm nhân viên mới", module: "Quản lý Nhân sự" },
            { code: "EDIT_EMPLOYEE", name: "Sửa thông tin nhân viên", module: "Quản lý Nhân sự" },
            { code: "DELETE_EMPLOYEE", name: "Xóa nhân viên", module: "Quản lý Nhân sự" },

            // Module Danh mục
            { code: "VIEW_CATEGORY", name: "Xem danh mục", module: "Quản lý Danh mục" },
            { code: "MANAGE_CATEGORY", name: "Quản lý danh mục (Thêm/Sửa/Xóa)", module: "Quản lý Danh mục" },

            // Module Hệ thống
            { code: "MANAGE_USER", name: "Quản lý User", module: "Hệ thống" },
            { code: "MANAGE_ROLE", name: "Quản lý Role & Phân quyền", module: "Hệ thống" },
            { code: "MANAGE_MENU", name: "Quản lý Menu (Builder)", module: "Hệ thống" },
        ];

        for (const p of permissions) {
            await prisma.pERMISSION.upsert({
                where: { code: p.code },
                update: { name: p.name, module: p.module },
                create: p
            });
        }

        return NextResponse.json({ message: "Seeded permissions successfully" });
    } catch (error) {
        console.error(error);
        return new NextResponse((error as Error).message || "Có lỗi xảy ra", { status: 500 });
    }
}
