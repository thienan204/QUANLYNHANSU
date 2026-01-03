import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { tenRole, moTa, permissionIds } = body;

        if (!tenRole) {
            return new NextResponse("Tên Role là bắt buộc", { status: 400 });
        }

        const updated = await prisma.rOLE.update({
            where: { id: Number(id) },
            data: {
                tenRole,
                moTa,
                permissions: {
                    set: [], // Clear existing relations
                    connect: permissionIds?.map((pid: number) => ({ id: pid })) || []
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return new NextResponse((error as Error).message || "Có lỗi xảy ra", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Check usage in User table
        const used = await prisma.user.findFirst({
            where: { roleId: Number(id) }
        });

        if (used) {
            return new NextResponse("Role đang được sử dụng bởi User, không thể xóa", { status: 400 });
        }

        await prisma.rOLE.delete({
            where: { id: Number(id) }
        });

        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse((error as Error).message || "Có lỗi xảy ra", { status: 500 });
    }
}
