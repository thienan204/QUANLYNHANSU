"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Popconfirm, message, Modal, Form, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { FORM_ITEM_STYLE } from "@/lib/form-config";

interface KhoaPhong {
    id: number;
    tenKhoaPhong: string;
    loaiKhoaPhong?: string;
}

export default function KhoaPhongPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<KhoaPhong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KhoaPhong | undefined>(undefined);
    const [isViewMode, setIsViewMode] = useState(false);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/khoa-phong");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setItems(data);
                } else {
                    setItems([]);
                }
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải danh sách Khoa Phòng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = () => {
        setEditingItem(undefined);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (item: KhoaPhong) => {
        setEditingItem(item);
        setIsViewMode(false);
        form.setFieldsValue({
            tenKhoaPhong: item.tenKhoaPhong,
            loaiKhoaPhong: item.loaiKhoaPhong
        });
        setIsModalOpen(true);
    };

    const handleView = (item: KhoaPhong) => {
        setEditingItem(item);
        setIsViewMode(true);
        form.setFieldsValue({
            tenKhoaPhong: item.tenKhoaPhong,
            loaiKhoaPhong: item.loaiKhoaPhong
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/khoa-phong/${id}`, { method: "DELETE" });
            if (res.ok) {
                message.success("Xóa thành công");
                fetchItems();
            } else {
                const msg = await res.text();
                message.error(msg || "Xóa thất bại");
            }
        } catch (e) {
            console.error(e);
            message.error("Có lỗi xảy ra");
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);

            const url = editingItem ? `/api/khoa-phong/${editingItem.id}` : "/api/khoa-phong";
            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Có lỗi xảy ra");
            }

            message.success(editingItem ? "Cập nhật thành công" : "Thêm mới thành công");
            setIsModalOpen(false);
            fetchItems();
        } catch (e: any) {
            console.error(e);
            message.error(e.message || "Có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnsType<KhoaPhong> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Tên Khoa Phòng',
            dataIndex: 'tenKhoaPhong',
            key: 'tenKhoaPhong',
            sorter: (a, b) => a.tenKhoaPhong.localeCompare(b.tenKhoaPhong),
        },
        {
            title: 'Loại Khoa Phòng',
            dataIndex: 'loaiKhoaPhong',
            key: 'loaiKhoaPhong',
            width: 200,
            filters: [
                { text: 'Khoa lâm sàng', value: 'Khoa lâm sàng' },
                { text: 'Khoa cận lâm sàng', value: 'Khoa cận lâm sàng' },
                { text: 'Phòng chức năng', value: 'Phòng chức năng' },
            ],
            onFilter: (value, record) => record.loaiKhoaPhong === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
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
                        title="Xóa Khoa Phòng"
                        description="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                        placement="left"
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="text-red-600"
                        />
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    if ((session?.user as any)?.role !== "ADMIN") {
        // return <div className="p-4">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Khoa Phòng</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                    className="bg-green-600 hover:bg-green-700"
                >
                    Thêm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                loading={isLoading}
                bordered
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={isViewMode ? "Chi tiết Khoa Phòng" : (editingItem ? "Sửa Khoa Phòng" : "Thêm Khoa Phòng")}
                open={isModalOpen}
                onOk={isViewMode ? () => setIsModalOpen(false) : handleSave}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isSubmitting}
                okText={isViewMode ? "Đóng" : "Lưu"}
                cancelButtonProps={{ style: { display: isViewMode ? 'none' : 'inline-block' } }}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item style={FORM_ITEM_STYLE}
                        name="tenKhoaPhong"
                        label="Tên Khoa Phòng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên Khoa Phòng' }]}
                    >
                        {isViewMode ? <span className="font-semibold">{editingItem?.tenKhoaPhong}</span> : <Input placeholder="Nhập tên khoa phòng..." />}
                    </Form.Item>

                    <Form.Item style={FORM_ITEM_STYLE}
                        name="loaiKhoaPhong"
                        label="Loại Khoa Phòng"
                    >
                        {isViewMode ? (
                            <span className="font-semibold">{editingItem?.loaiKhoaPhong}</span>
                        ) : (
                            <Select placeholder="Chọn loại khoa phòng" allowClear>
                                <Select.Option value="Khoa lâm sàng">Khoa lâm sàng</Select.Option>
                                <Select.Option value="Khoa cận lâm sàng">Khoa cận lâm sàng</Select.Option>
                                <Select.Option value="Phòng chức năng">Phòng chức năng</Select.Option>
                            </Select>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
