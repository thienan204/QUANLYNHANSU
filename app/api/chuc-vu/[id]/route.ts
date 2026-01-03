import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenChucVu } = body;

        if (!tenChucVu) {
            return new NextResponse("Tên Chức Vụ là bắt buộc", { status: 400 });
        }

        const updated = await prisma.cHUCVU.update({
            where: { id: parseInt(id) },
            data: { tenChucVu },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating Chuc Vu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const usage = await prisma.nHANVIEN.count({
            where: { chucVuId: parseInt(id) }
        });

        if (usage > 0) {
            return new NextResponse("Không thể xóa Chức Vụ đang được sử dụng", { status: 400 });
        }

        await prisma.cHUCVU.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("Deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting Chuc Vu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
