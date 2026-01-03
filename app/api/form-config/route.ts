
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    try {
        const config = await prisma.formConfig.findUnique({
            where: { formKey: key }
        });
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { key, layout } = body;

        if (!key || !layout) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const config = await prisma.formConfig.upsert({
            where: { formKey: key },
            update: { layout },
            create: { formKey: key, layout }
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
