
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const items = await prisma.menuItem.findMany({
            orderBy: { order: 'asc' },
            include: { children: { orderBy: { order: 'asc' } } }
        });

        // Build tree structure
        const rootItems = items.filter(item => !item.parentId);
        // Children are already included but flattened in `items` for easy finding if needed, 
        // however `include` handles one level. For deeper nested we might need recursive strategy, 
        // but for now let's assume 2 levels (Parent -> Child) which is what `include` gives directly 
        // OR filtering from flat list is robust.
        // Let's stick to flat list return and handle tree on client OR return tree from here if needed.
        // Prisma `include: { children: ... }` gives us direct children. 
        // If we want full tree we can just return rootItems (since they contain children).
        // But `items` contains ALL.

        return NextResponse.json(rootItems);
    } catch (error) {
        return new NextResponse("Error fetching menu", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { label, path, icon, parentId, permissionCode, order } = body;

        const newItem = await prisma.menuItem.create({
            data: {
                label,
                path,
                icon,
                parentId: parentId ? Number(parentId) : null,
                permissionCode,
                order: order || 0
            }
        });
        return NextResponse.json(newItem);
    } catch (error) {
        return new NextResponse("Error creating menu item", { status: 500 });
    }
}

export async function PUT(req: Request) {
    // Bulk update for reordering OR single update
    // Let's handle generic update for now
    try {
        const body = await req.json();
        const { id, ...data } = body;

        if (Array.isArray(body)) {
            // Bulk update order
            for (const item of body) {
                await prisma.menuItem.update({
                    where: { id: item.id },
                    data: { order: item.order, parentId: item.parentId }
                });
            }
            return NextResponse.json({ success: true });
        }

        const updated = await prisma.menuItem.update({
            where: { id },
            data
        });
        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse("Error updating menu", { status: 500 });
    }
}
