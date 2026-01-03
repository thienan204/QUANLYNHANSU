import * as XLSX from 'xlsx';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = "postgresql://root:root@localhost:5432/humandkls?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const filename = 'Danh sách lãnh đạo.xlsx';

function parseExcelDate(value: any): Date | null {
    if (!value) return null;

    // If number, it's an Excel serial date
    if (typeof value === 'number') {
        // Excel date serial starts from 1900-01-01. converting to JS date
        return new Date(Math.round((value - 25569) * 864e5));
    }

    // If string like "dd/mm/yyyy"
    if (typeof value === 'string') {
        const parts = value.trim().split('/');
        if (parts.length === 3) {
            // month is 0-indexed in JS
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    }

    return null;
}

async function main() {
    try {
        const workbook = XLSX.readFile(filename);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Read all rows as array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Data starts from index 4 (row 5 in Excel)
        // Filter out rows where Col 0 (Mã NV) is empty
        const dataRows = jsonData.slice(4).filter(row => row[0]);

        console.log(`Found ${dataRows.length} rows to import.`);

        for (const row of dataRows) {
            const maNv = String(row[0]).trim();

            const nhanVienData = {
                maNv: maNv,
                stt: row[1] ? parseInt(row[1]) : null,
                hoTen: row[2] ? String(row[2]).trim() : null,
                chucVu: row[3] ? String(row[3]).trim() : null,
                trinhDo: row[4] ? String(row[4]).trim() : null,
                khoaPhong: row[5] ? String(row[5]).trim() : null,
                ngayBoNhiem: parseExcelDate(row[6]),
                ngayBoNhiemLai: parseExcelDate(row[7]),
                lyLuanChinhTri: row[8] ? String(row[8]).trim() : null,
                qlNhaNuoc: row[9] ? String(row[9]).trim() : null,
                qlBenhVien: row[10] ? String(row[10]).trim() : null,
                ngoaiNgu: row[11] ? String(row[11]).trim() : null,
                tinHoc: row[12] ? String(row[12]).trim() : null,
                qpAnNinh: row[13] ? String(row[13]).trim() : null,
                ngayBnl: parseExcelDate(row[14]),
                ghiChu: row[15] ? String(row[15]).trim() : null,
            };

            // Upsert to avoid duplicates if re-running
            await prisma.nHANVIEN.upsert({
                where: { maNv: maNv },
                update: nhanVienData,
                create: nhanVienData,
            });
        }

        console.log("Import completed successfully!");

    } catch (e) {
        console.error("Error importing data:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
