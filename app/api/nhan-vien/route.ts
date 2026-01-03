import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Lấy danh sách nhân viên
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        let whereClause = {};
        if (query) {
            whereClause = {
                OR: [
                    { hoTen: { contains: query, mode: 'insensitive' } },
                    { maNv: { contains: query, mode: 'insensitive' } },
                    { khoaPhong: { contains: query, mode: 'insensitive' } },
                ]
            };
        }

        const nhanViens = await prisma.nHANVIEN.findMany({
            where: whereClause,
            include: {
                gioiTinh: true,
                khoaPhongRef: true,
                chucDanhRef: true,
                trinhDoRef: true,
                chucVuRef: true,
                danTocRef: true,
                hopDongRef: true,
                chungChiHanhNgheRef: true,
                kiemNhiem: { include: { khoaPhong: true, chucVu: true } }
            },
            orderBy: { id: 'desc' } // Mới nhất lên đầu
        });
        return NextResponse.json(nhanViens);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json({ error: "Lỗi tải danh sách nhân viên" }, { status: 500 });
    }
}

// POST: Thêm nhân viên mới
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            maNv, hoTen, chucVu, trinhDo, khoaPhong,
            ngayBoNhiem, ngayBoNhiemLai, lyLuanChinhTri,
            qlNhaNuoc, qlBenhVien, ngoaiNgu, tinHoc,
            qpAnNinh, ngayBnl, ghiChu, ngaySinh, gioitinh,
            khoaPhongId, chucDanhId, trinhDoId, chucVuId,
            danTocId, hopDongId, chungChiHanhNgheId,
            kiemNhiem // Array of { khoaPhongId, chucVuId }
        } = body;

        // Validation standard
        if (!maNv || !hoTen) {
            return NextResponse.json({ error: "Mã NV và Họ tên là bắt buộc" }, { status: 400 });
        }

        const existingNv = await prisma.nHANVIEN.findUnique({
            where: { maNv }
        });

        if (existingNv) {
            return NextResponse.json({ error: "Mã nhân viên đã tồn tại" }, { status: 400 });
        }

        const newNhanVien = await prisma.nHANVIEN.create({
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
                    create: kiemNhiem?.map((k: any) => ({
                        khoaPhongId: Number(k.khoaPhongId),
                        chucVuId: Number(k.chucVuId)
                    }))
                }
            }
        });

        return NextResponse.json(newNhanVien);
    } catch (error: any) {
        console.error("Error creating employee:", error);
        return NextResponse.json({ error: error.message || "Lỗi server" }, { status: 500 });
    }
}
