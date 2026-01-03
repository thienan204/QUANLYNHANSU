import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const genders = await prisma.gIOITINH.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(genders);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch genders" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenGioiTinh } = body;

        console.log("DEBUG: Prisma keys available:", Object.keys(prisma).filter(k => !k.startsWith('_')));

        if (!tenGioiTinh) {
            return new NextResponse("Tên giới tính là bắt buộc", { status: 400 });
        }

        const existing = await prisma.gIOITINH.findUnique({
            where: { tenGioiTinh }
        });

        if (existing) {
            return new NextResponse("Giới tính đã tồn tại", { status: 409 });
        }

        const newGender = await prisma.gIOITINH.create({
            data: { tenGioiTinh }
        });

        return NextResponse.json(newGender);
    } catch (error) {
        console.error("Error creating gender:", error);
        return NextResponse.json(
            { error: "Failed to create gender" },
            { status: 500 }
        );
    }
}
