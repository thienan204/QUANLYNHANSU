
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        await prisma.menuItem.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Error deleting menu item", { status: 500 });
    }
}
