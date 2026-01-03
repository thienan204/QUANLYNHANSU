import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenChungChi, noiCap } = body;
        if (!tenChungChi) return new NextResponse("Tên chứng chỉ là bắt buộc", { status: 400 });

        const updated = await prisma.cHUNGCHIHANHNGHE.update({
            where: { id: Number(id) },
            data: { tenChungChi, noiCap }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const usage = await prisma.nHANVIEN.findFirst({ where: { chungChiHanhNgheId: Number(id) } });
        if (usage) return new NextResponse("Không thể xóa vì đang được sử dụng", { status: 400 });

        await prisma.cHUNGCHIHANHNGHE.delete({ where: { id: Number(id) } });
        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}
