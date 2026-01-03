const XLSX = require('xlsx');

const filename = 'Danh sách lãnh đạo.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Rows 0-3 are headers/title. Data starts at row 4 (index 4)
    const dataRows = jsonData.slice(4, 10);
    console.log("Data Rows:", JSON.stringify(dataRows, null, 2));

} catch (e) {
    console.error("Error reading file:", e.message);
}
