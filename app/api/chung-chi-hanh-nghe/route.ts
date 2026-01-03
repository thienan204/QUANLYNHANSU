import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.cHUNGCHIHANHNGHE.findMany({ orderBy: { id: 'asc' } });
        return NextResponse.json(items);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenChungChi, noiCap } = body;
        if (!tenChungChi) return new NextResponse("Tên chứng chỉ là bắt buộc", { status: 400 });

        const exists = await prisma.cHUNGCHIHANHNGHE.findUnique({ where: { tenChungChi } });
        if (exists) return new NextResponse("Chứng chỉ đã tồn tại", { status: 409 });

        const newItem = await prisma.cHUNGCHIHANHNGHE.create({ data: { tenChungChi, noiCap } });
        return NextResponse.json(newItem);
    } catch (error) {
        return new NextResponse((error as Error).message, { status: 500 });
    }
}
