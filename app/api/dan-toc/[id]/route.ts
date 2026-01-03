import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenDanToc } = body;
        if (!tenDanToc) return new NextResponse("Tên dân tộc là bắt buộc", { status: 400 });

        const updated = await prisma.dANTOC.update({
            where: { id: Number(id) },
            data: { tenDanToc }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const usage = await prisma.nHANVIEN.findFirst({ where: { danTocId: Number(id) } });
        if (usage) return new NextResponse("Không thể xóa vì đang được sử dụng", { status: 400 });

        await prisma.dANTOC.delete({ where: { id: Number(id) } });
        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}
