import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.cHUCVU.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch Chuc Vu" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenChucVu } = body;

        if (!tenChucVu) {
            return new NextResponse("Tên Chức Vụ là bắt buộc", { status: 400 });
        }

        const existing = await prisma.cHUCVU.findUnique({
            where: { tenChucVu }
        });

        if (existing) {
            return new NextResponse("Chức Vụ đã tồn tại", { status: 409 });
        }

        const newItem = await prisma.cHUCVU.create({
            data: { tenChucVu }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error("Error creating Chuc Vu:", error);
        return NextResponse.json(
            { error: "Failed to create Chuc Vu: " + (error as Error).message },
            { status: 500 }
        );
    }
}
