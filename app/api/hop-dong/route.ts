import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.hOPDONG.findMany({ orderBy: { id: 'asc' } });
        return NextResponse.json(items);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { loaiHopDong, moTa } = body;
        if (!loaiHopDong) return new NextResponse("Loại hợp đồng là bắt buộc", { status: 400 });

        const exists = await prisma.hOPDONG.findUnique({ where: { loaiHopDong } });
        if (exists) return new NextResponse("Loại hợp đồng đã tồn tại", { status: 409 });

        const newItem = await prisma.hOPDONG.create({ data: { loaiHopDong, moTa } });
        return NextResponse.json(newItem);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}
