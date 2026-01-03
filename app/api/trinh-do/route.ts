import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.tRINHDO.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch Trinh Do" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenTrinhDo } = body;

        if (!tenTrinhDo) {
            return new NextResponse("Tên Trình Độ là bắt buộc", { status: 400 });
        }

        const existing = await prisma.tRINHDO.findUnique({
            where: { tenTrinhDo }
        });

        if (existing) {
            return new NextResponse("Trình Độ đã tồn tại", { status: 409 });
        }

        const newItem = await prisma.tRINHDO.create({
            data: { tenTrinhDo }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error("Error creating Trinh Do:", error);
        return NextResponse.json(
            { error: "Failed to create Trinh Do: " + (error as Error).message },
            { status: 500 }
        );
    }
}
