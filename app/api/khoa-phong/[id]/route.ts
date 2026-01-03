import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenKhoaPhong, loaiKhoaPhong } = body;

        if (!tenKhoaPhong) {
            return new NextResponse("Tên Khoa Phòng là bắt buộc", { status: 400 });
        }

        // Check duplicate name if name changed
        // ... (existing duplicate check logic if needed, or simplified) ...

        const updated = await prisma.kHOAPHONG.update({
            where: { id: Number(id) },
            data: { tenKhoaPhong, loaiKhoaPhong }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating Khoa Phong:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const usage = await prisma.nHANVIEN.count({
            where: { khoaPhongId: parseInt(id) }
        });

        if (usage > 0) {
            return new NextResponse("Không thể xóa Khoa Phòng đang được sử dụng", { status: 400 });
        }

        await prisma.kHOAPHONG.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("Deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting Khoa Phong:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
