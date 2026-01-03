import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const genders = ['Nam', 'Nữ'];
        for (const g of genders) {
            const exists = await prisma.gIOITINH.findUnique({
                where: { tenGioiTinh: g },
            });
            if (!exists) {
                await prisma.gIOITINH.create({
                    data: { tenGioiTinh: g },
                });
            }
        }
        return NextResponse.json({ message: "Seeding successful" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
    }
}
