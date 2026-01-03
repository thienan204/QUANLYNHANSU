import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.rOLE.findMany({
            include: { permissions: true },
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error(error);
        return new NextResponse("Lỗi tải danh sách Role", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tenRole, moTa, permissionIds } = body;

        if (!tenRole) {
            return new NextResponse("Tên Role là bắt buộc", { status: 400 });
        }

        const existing = await prisma.rOLE.findUnique({
            where: { tenRole }
        });

        if (existing) {
            return new NextResponse("Mã Role đã tồn tại", { status: 400 });
        }

        const newItem = await prisma.rOLE.create({
            data: {
                tenRole,
                moTa,
                permissions: permissionIds ? {
                    connect: permissionIds.map((id: number) => ({ id }))
                } : undefined
            }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error(error);
        return new NextResponse((error as Error).message || "Có lỗi xảy ra", { status: 500 });
    }
}
