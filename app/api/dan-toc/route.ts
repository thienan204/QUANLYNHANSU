import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.dANTOC.findMany({ orderBy: { id: 'asc' } });
        return NextResponse.json(items);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenDanToc } = body;
        if (!tenDanToc) return new NextResponse("Tên dân tộc là bắt buộc", { status: 400 });

        const exists = await prisma.dANTOC.findUnique({ where: { tenDanToc } });
        if (exists) return new NextResponse("Dân tộc đã tồn tại", { status: 409 });

        const newItem = await prisma.dANTOC.create({ data: { tenDanToc } });
        return NextResponse.json(newItem);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}
