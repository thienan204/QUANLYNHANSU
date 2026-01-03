"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Popconfirm, message, Modal, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { FORM_ITEM_STYLE } from "@/lib/form-config";

interface HopDong {
    id: number;
    loaiHopDong: string;
    moTa?: string;
}

export default function HopDongPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<HopDong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HopDong | undefined>(undefined);
    const [isViewMode, setIsViewMode] = useState(false);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/hop-dong");
            if (res.ok) {
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = () => {
        setEditingItem(undefined);
        setIsViewMode(false);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (item: HopDong) => {
        setEditingItem(item);
        setIsViewMode(false);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleView = (item: HopDong) => {
        setEditingItem(item);
        setIsViewMode(true);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/hop-dong/${id}`, { method: "DELETE" });
            if (res.ok) {
                message.success("Xóa thành công");
                fetchItems();
            } else {
                const msg = await res.text();
                message.error(msg || "Xóa thất bại");
            }
        } catch (e) {
            message.error("Có lỗi xảy ra");
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmitting(true);
            const url = editingItem ? `/api/hop-dong/${editingItem.id}` : "/api/hop-dong";
            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            message.success(editingItem ? "Cập nhật thành công" : "Thêm mới thành công");
            setIsModalOpen(false);
            fetchItems();
        } catch (e: any) {
            message.error(e.message || "Có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: ColumnsType<HopDong> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
        { title: 'Loại Hợp Đồng', dataIndex: 'loaiHopDong', key: 'loaiHopDong', sorter: (a, b) => a.loaiHopDong.localeCompare(b.loaiHopDong) },
        { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa' },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EyeOutlined />} className="text-green-600" onClick={() => handleView(record)} />
                    <Button type="text" icon={<EditOutlined />} className="text-blue-600" onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
                        <Button type="text" icon={<DeleteOutlined />} className="text-red-600" />
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Hợp Đồng</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-green-600">Thêm mới</Button>
            </div>
            <Table columns={columns} dataSource={items} rowKey="id" loading={isLoading} bordered pagination={{ pageSize: 10 }} />
            <Modal
                title={isViewMode ? "Chi tiết" : (editingItem ? "Sửa" : "Thêm mới")}
                open={isModalOpen}
                onOk={isViewMode ? () => setIsModalOpen(false) : handleSave}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isSubmitting}
                okText={isViewMode ? "Đóng" : "Lưu"}
                cancelButtonProps={{ style: { display: isViewMode ? 'none' : 'inline-block' } }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item style={FORM_ITEM_STYLE} name="loaiHopDong" label="Loại Hợp Đồng" rules={[{ required: true, message: 'Nhập loại hợp đồng' }]}>
                        {isViewMode ? <span className="font-semibold">{editingItem?.loaiHopDong}</span> : <Input />}
                    </Form.Item>
                    <Form.Item style={FORM_ITEM_STYLE} name="moTa" label="Mô tả">
                        {isViewMode ? <span className="font-semibold">{editingItem?.moTa}</span> : <Input.TextArea />}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
