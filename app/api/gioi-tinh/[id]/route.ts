import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Cập nhật giới tính
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenGioiTinh } = body;

        if (!tenGioiTinh) {
            return new NextResponse("Tên giới tính là bắt buộc", { status: 400 });
        }

        const updated = await prisma.gIOITINH.update({
            where: { id: parseInt(id) },
            data: { tenGioiTinh },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating gender:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE: Xóa giới tính
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Kiểm tra xem có nhân viên nào đang dùng giới tính này không
        const usage = await prisma.nHANVIEN.count({
            where: { gioiTinhId: parseInt(id) }
        });

        if (usage > 0) {
            return new NextResponse("Không thể xóa giới tính đang được sử dụng", { status: 400 });
        }

        await prisma.gIOITINH.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("Gender deleted", { status: 200 });
    } catch (error) {
        console.error("Error deleting gender:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
