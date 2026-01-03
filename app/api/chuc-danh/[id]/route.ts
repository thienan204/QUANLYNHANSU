import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenChucDanh } = body;

        if (!tenChucDanh) {
            return new NextResponse("Tên Chức Danh là bắt buộc", { status: 400 });
        }

        const updated = await prisma.cHUCDANH.update({
            where: { id: parseInt(id) },
            data: { tenChucDanh },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating Chuc Danh:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const usage = await prisma.nHANVIEN.count({
            where: { chucDanhId: parseInt(id) }
        });

        if (usage > 0) {
            return new NextResponse("Không thể xóa Chức Danh đang được sử dụng", { status: 400 });
        }

        await prisma.cHUCDANH.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("Deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting Chuc Danh:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
