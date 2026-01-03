import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.kHOAPHONG.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch Khoa Phong" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenKhoaPhong, loaiKhoaPhong } = body;

        console.log("Creating Khoa Phong:", tenKhoaPhong);
        console.log("Available keys:", Object.keys(prisma).filter(k => !k.startsWith('_')));

        if (!tenKhoaPhong) {
            return new NextResponse("Tên Khoa Phòng là bắt buộc", { status: 400 });
        }

        const existing = await prisma.kHOAPHONG.findUnique({
            where: { tenKhoaPhong }
        });

        if (existing) {
            return new NextResponse("Khoa Phòng đã tồn tại", { status: 409 });
        }

        const newItem = await prisma.kHOAPHONG.create({
            data: { tenKhoaPhong, loaiKhoaPhong }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error("Error creating Khoa Phong:", error);
        return NextResponse.json(
            { error: "Failed to create Khoa Phong: " + (error as Error).message },
            { status: 500 }
        );
    }
}
