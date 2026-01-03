"use client";

import { useEffect, useState } from "react";
import EmployeeModal from "../../components/EmployeeModal";
import { useSession } from "next-auth/react";
import { Table, Button, Space, Input, Popconfirm, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function EmployeePage() {
    const { data: session } = useSession();
    // Quy ước: Chỉ cần đăng nhập là xem được, nhưng thêm/sửa/xóa có thể cần quyền.
    // Tạm thời cho phép tất cả logged-in user thao tác, hoặc giới hạn Admin nếu muốn.
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const [employees, setEmployees] = useState<any[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]); // State for client-side filtering
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingEmployee, setEditingEmployee] = useState<any | undefined>(undefined);
    const [isViewMode, setIsViewMode] = useState(false);

    // Filters state (object for per-column filter)
    const [filters, setFilters] = useState({
        maNv: "",
        hoTen: "",
        khoaPhong: "",
        chucVu: "",
    });

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/nhan-vien`);
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
                setFilteredEmployees(data); // Init filtered list
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Effect to apply filters
    useEffect(() => {
        const lowerMaNv = filters.maNv.toLowerCase();
        const lowerHoTen = filters.hoTen.toLowerCase();
        const lowerKhoa = filters.khoaPhong.toLowerCase();
        const lowerChucVu = filters.chucVu.toLowerCase();

        const filtered = employees.filter(emp => {
            const matchMaNv = (emp.maNv || "").toLowerCase().includes(lowerMaNv);
            const matchHoTen = (emp.hoTen || "").toLowerCase().includes(lowerHoTen);
            const matchKhoa = (emp.khoaPhong || "").toLowerCase().includes(lowerKhoa);
            const matchChucVu = (emp.chucVu || "").toLowerCase().includes(lowerChucVu);
            return matchMaNv && matchHoTen && matchKhoa && matchChucVu;
        });
        setFilteredEmployees(filtered);
    }, [filters, employees]);


    const handleAdd = () => {
        setEditingEmployee(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (emp: any) => {
        setEditingEmployee(emp);
        setIsViewMode(false);
        setIsModalOpen(true);
    };

    const handleView = (emp: any) => {
        setEditingEmployee(emp);
        setIsViewMode(true); // Enable View Mode
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/nhan-vien/${id}`, { method: "DELETE" });
            if (res.ok) {
                message.success("Xóa thành công");
                fetchEmployees();
            }
            else {
                message.error("Xóa thất bại");
            }
        } catch (e) {
            console.error(e);
            message.error("Có lỗi xảy ra");
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Helper to render Column Title with embedded Input
    const renderHeader = (title: string, field: string) => (
        <div className="flex flex-col gap-2 py-1" onClick={(e) => e.stopPropagation()}>
            <span className="font-semibold">{title}</span>
            <Input
                placeholder={`Tìm ${title}`}
                size="small"
                value={(filters as any)[field]}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                allowClear
            />
        </div>
    );

    const columns: ColumnsType<any> = [
        {
            title: renderHeader('Mã NV', 'maNv'),
            dataIndex: 'maNv',
            key: 'maNv',
            width: 150,
            sorter: (a, b) => a.maNv.localeCompare(b.maNv),
        },
        {
            title: renderHeader('Họ và Tên', 'hoTen'),
            dataIndex: 'hoTen',
            key: 'hoTen',
            sorter: (a, b) => a.hoTen.localeCompare(b.hoTen),
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'ngaySinh',
            key: 'ngaySinh',
            width: 120,
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '',
            sorter: (a, b) => {
                if (!a.ngaySinh) return -1;
                if (!b.ngaySinh) return 1;
                return new Date(a.ngaySinh).getTime() - new Date(b.ngaySinh).getTime();
            }
        },
        {
            title: 'Giới tính',
            dataIndex: 'gioiTinh',
            key: 'gioiTinh',
            width: 100,
            render: (gioiTinh) => gioiTinh?.tenGioiTinh || '',
            filters: [
                { text: 'Nam', value: 'Nam' },
                { text: 'Nữ', value: 'Nữ' },
            ],
            onFilter: (value, record) => record.gioiTinh?.tenGioiTinh === value,
        },
        {
            title: renderHeader('Khoa/Phòng', 'khoaPhong'),
            dataIndex: 'khoaPhong',
            key: 'khoaPhong',
            width: 200,
            sorter: (a, b) => (a.khoaPhong || "").localeCompare(b.khoaPhong || ""),
        },
        {
            title: renderHeader('Chức vụ', 'chucVu'),
            dataIndex: 'chucVu',
            key: 'chucVu',
            width: 200,
            sorter: (a, b) => (a.chucVu || "").localeCompare(b.chucVu || ""),
        },
        {
            title: 'Ngày bổ nhiệm',
            dataIndex: 'ngayBoNhiem',
            key: 'ngayBoNhiem',
            width: 150,
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '',
            sorter: (a, b) => {
                if (!a.ngayBoNhiem) return -1;
                if (!b.ngayBoNhiem) return 1;
                return new Date(a.ngayBoNhiem).getTime() - new Date(b.ngayBoNhiem).getTime();
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        className="text-green-600"
                        onClick={() => handleView(record)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        className="text-blue-600"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa nhân viên"
                        description="Bạn có chắc chắn muốn xóa nhân viên này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="text-red-600"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Danh sách Nhân viên</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                    className="bg-green-600 hover:bg-green-700"
                >
                    Thêm NV
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredEmployees} // Use filtered data
                rowKey="id"
                loading={isLoading}
                bordered
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 1000 }}
            />

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => fetchEmployees()}
                onSave={() => fetchEmployees()}
                employee={editingEmployee}
                isViewMode={isViewMode}
            />
        </div>
    );
}
