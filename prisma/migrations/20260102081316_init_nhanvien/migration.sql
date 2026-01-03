-- CreateTable
CREATE TABLE "nhan_vien" (
    "id" SERIAL NOT NULL,
    "ma_nv" TEXT,
    "stt" INTEGER,
    "ho_ten" TEXT,
    "chuc_vu" TEXT,
    "trinh_do" TEXT,
    "khoa_phong" TEXT,
    "ngay_bo_nhiem" TIMESTAMP(3),
    "ngay_bo_nhiem_lai" TIMESTAMP(3),
    "ly_luan_chinh_tri" TEXT,
    "ql_nha_nuoc" TEXT,
    "ql_benh_vien" TEXT,
    "ngoai_ngu" TEXT,
    "tin_hoc" TEXT,
    "qp_an_ninh" TEXT,
    "ngay_bnl" TIMESTAMP(3),
    "ghi_chu" TEXT,

    CONSTRAINT "nhan_vien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nhan_vien_ma_nv_key" ON "nhan_vien"("ma_nv");
