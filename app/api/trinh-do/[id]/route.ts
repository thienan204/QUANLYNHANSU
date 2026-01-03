import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenTrinhDo } = body;

        if (!tenTrinhDo) {
            return new NextResponse("Tên Trình Độ là bắt buộc", { status: 400 });
        }

        const updated = await prisma.tRINHDO.update({
            where: { id: parseInt(id) },
            data: { tenTrinhDo },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating Trinh Do:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const usage = await prisma.nHANVIEN.count({
            where: { trinhDoId: parseInt(id) }
        });

        if (usage > 0) {
            return new NextResponse("Không thể xóa Trình Độ đang được sử dụng", { status: 400 });
        }

        await prisma.tRINHDO.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("Deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting Trinh Do:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
