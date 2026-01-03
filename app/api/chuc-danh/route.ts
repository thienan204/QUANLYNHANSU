import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.cHUCDANH.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch Chuc Danh" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenChucDanh } = body;

        if (!tenChucDanh) {
            return new NextResponse("Tên Chức Danh là bắt buộc", { status: 400 });
        }

        const existing = await prisma.cHUCDANH.findUnique({
            where: { tenChucDanh }
        });

        if (existing) {
            return new NextResponse("Chức Danh đã tồn tại", { status: 409 });
        }

        const newItem = await prisma.cHUCDANH.create({
            data: { tenChucDanh }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error("Error creating Chuc Danh:", error);
        return NextResponse.json(
            { error: "Failed to create Chuc Danh: " + (error as Error).message },
            { status: 500 }
        );
    }
}
