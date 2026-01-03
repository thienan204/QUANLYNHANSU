import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// GET: Lấy danh sách users
export async function GET() {
    const session = await getServerSession(authOptions);

    // Kiểm tra quyền ADMIN
    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
            },
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// POST: Tạo user mới
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { username, password, roleId } = body;

        if (!username || !password) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Kiểm tra username đã tồn tại
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return new NextResponse("Username already exists", { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                roleId: roleId ? Number(roleId) : null,
                // Optionally set role string based on roleId lookup if needed for legacy support
            },
        });

        // Trả về user không có password
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("User Create Error:", error);
        return new NextResponse((error as Error).message || "Internal Server Error", { status: 500 });
    }
}
