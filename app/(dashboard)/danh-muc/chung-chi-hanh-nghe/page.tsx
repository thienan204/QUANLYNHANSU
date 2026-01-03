"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Popconfirm, message, Modal, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { FORM_ITEM_STYLE } from "@/lib/form-config";

interface ChungChi {
    id: number;
    tenChungChi: string;
    noiCap?: string;
}

export default function ChungChiPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ChungChi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ChungChi | undefined>(undefined);
    const [isViewMode, setIsViewMode] = useState(false);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/chung-chi-hanh-nghe");
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

    const handleEdit = (item: ChungChi) => {
        setEditingItem(item);
        setIsViewMode(false);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleView = (item: ChungChi) => {
        setEditingItem(item);
        setIsViewMode(true);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/chung-chi-hanh-nghe/${id}`, { method: "DELETE" });
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
            const url = editingItem ? `/api/chung-chi-hanh-nghe/${editingItem.id}` : "/api/chung-chi-hanh-nghe";
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

    const columns: ColumnsType<ChungChi> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
        { title: 'Tên Chứng Chỉ', dataIndex: 'tenChungChi', key: 'tenChungChi', sorter: (a, b) => a.tenChungChi.localeCompare(b.tenChungChi) },
        { title: 'Nơi Cấp', dataIndex: 'noiCap', key: 'noiCap' },
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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Chứng Chỉ Hành Nghề</h1>
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
                    <Form.Item style={FORM_ITEM_STYLE} name="tenChungChi" label="Tên Chứng Chỉ" rules={[{ required: true, message: 'Nhập tên chứng chỉ' }]}>
                        {isViewMode ? <span className="font-semibold">{editingItem?.tenChungChi}</span> : <Input />}
                    </Form.Item>
                    <Form.Item style={FORM_ITEM_STYLE} name="noiCap" label="Nơi Cấp">
                        {isViewMode ? <span className="font-semibold">{editingItem?.noiCap}</span> : <Input />}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
