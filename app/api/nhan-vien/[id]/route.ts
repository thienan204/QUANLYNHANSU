import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// PUT: Cập nhật nhân viên
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();

        // Xử lý dữ liệu ngày tháng
        const {
            maNv, hoTen, chucVu, trinhDo, khoaPhong,
            ngayBoNhiem, ngayBoNhiemLai, lyLuanChinhTri,
            qlNhaNuoc, qlBenhVien, ngoaiNgu, tinHoc,
            qpAnNinh, ngayBnl, ghiChu, ngaySinh, gioitinh,
            khoaPhongId, chucDanhId, trinhDoId, chucVuId,
            danTocId, hopDongId, chungChiHanhNgheId,
            kiemNhiem // Array of { khoaPhongId, chucVuId }
        } = body;

        const updatedNhanVien = await prisma.nHANVIEN.update({
            where: { id: Number(id) },
            data: {
                maNv, hoTen, chucVu, trinhDo, khoaPhong,
                ngayBoNhiem: ngayBoNhiem ? new Date(ngayBoNhiem) : null,
                ngayBoNhiemLai: ngayBoNhiemLai ? new Date(ngayBoNhiemLai) : null,
                lyLuanChinhTri, qlNhaNuoc, qlBenhVien, ngoaiNgu, tinHoc, qpAnNinh,
                ngayBnl: ngayBnl ? new Date(ngayBnl) : null,
                ghiChu,
                ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
                gioiTinhId: gioitinh ? Number(gioitinh) : null,
                khoaPhongId: khoaPhongId ? Number(khoaPhongId) : null,
                chucDanhId: chucDanhId ? Number(chucDanhId) : null,
                trinhDoId: trinhDoId ? Number(trinhDoId) : null,
                chucVuId: chucVuId ? Number(chucVuId) : null,
                danTocId: danTocId ? Number(danTocId) : null,
                hopDongId: hopDongId ? Number(hopDongId) : null,
                chungChiHanhNgheId: chungChiHanhNgheId ? Number(chungChiHanhNgheId) : null,
                kiemNhiem: {
                    deleteMany: {},
                    create: kiemNhiem?.map((k: any) => ({
                        khoaPhongId: Number(k.khoaPhongId),
                        chucVuId: Number(k.chucVuId)
                    }))
                }
            }
        });
        return NextResponse.json(updatedNhanVien);
    } catch (error) {
        console.error("Error updating employee:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE: Xóa nhân viên
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.nHANVIEN.delete({
            where: { id: parseInt(id) },
        });

        return new NextResponse("Employee deleted", { status: 200 });
    } catch (error) {
        console.error("Error deleting employee:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
