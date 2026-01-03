import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// PUT: Cập nhật thông tin user
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { password, roleId } = body;

        const dataToUpdate: any = { roleId: roleId ? Number(roleId) : null };
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: dataToUpdate
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("User Update/Delete Error:", error);
        return new NextResponse((error as Error).message || "Internal Server Error", { status: 500 });
    }
}

// DELETE: Xóa user
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("User deleted", { status: 200 });
    } catch (error) {
        console.error("User Delete Error:", error);
        return new NextResponse((error as Error).message || "Internal Server Error", { status: 500 });
    }
}
