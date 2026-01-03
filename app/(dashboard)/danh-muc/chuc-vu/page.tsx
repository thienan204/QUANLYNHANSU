"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Popconfirm, message, Modal, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { FORM_ITEM_STYLE } from "@/lib/form-config";

interface ChucVu {
    id: number;
    tenChucVu: string;
}

export default function ChucVuPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ChucVu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ChucVu | undefined>(undefined);
    const [isViewMode, setIsViewMode] = useState(false);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/chuc-vu");
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
            message.error("Lỗi tải danh sách Chức Vụ");
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

    const handleEdit = (item: ChucVu) => {
        setEditingItem(item);
        setIsViewMode(false);
        form.setFieldsValue({ tenChucVu: item.tenChucVu });
        setIsModalOpen(true);
    };

    const handleView = (item: ChucVu) => {
        setEditingItem(item);
        setIsViewMode(true);
        form.setFieldsValue({ tenChucVu: item.tenChucVu });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/chuc-vu/${id}`, { method: "DELETE" });
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

            const url = editingItem ? `/api/chuc-vu/${editingItem.id}` : "/api/chuc-vu";
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

    const columns: ColumnsType<ChucVu> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Tên Chức Vụ',
            dataIndex: 'tenChucVu',
            key: 'tenChucVu',
            sorter: (a, b) => a.tenChucVu.localeCompare(b.tenChucVu),
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
                        title="Xóa Chức Vụ"
                        description="Bạn có chắc chắn muốn xóa?"
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
        }
    ];

    if ((session?.user as any)?.role !== "ADMIN") {
        // return <div className="p-4">Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Chức Vụ</h1>
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
                scroll={{ x: 600 }}
            />

            <Modal
                title={isViewMode ? "Chi tiết Chức Vụ" : (editingItem ? "Sửa Chức Vụ" : "Thêm Chức Vụ")}
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
                        name="tenChucVu"
                        label="Tên Chức Vụ"
                        rules={[{ required: true, message: 'Vui lòng nhập tên Chức Vụ' }]}
                    >
                        {isViewMode ? <span className="font-semibold">{editingItem?.tenChucVu}</span> : <Input placeholder="Nhập tên chức vụ..." />}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
