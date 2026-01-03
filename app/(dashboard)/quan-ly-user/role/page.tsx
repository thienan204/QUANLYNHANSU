"use client";

import { useEffect, useState } from "react";
import { Table, Button, Space, Input, Popconfirm, message, Modal, Form, Select, Checkbox, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

interface Role {
    id: number;
    tenRole: string;
    moTa?: string;
    permissions?: Permission[];
}

interface Permission {
    id: number;
    code: string;
    name: string;
    module: string;
}

export default function RolePage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Role | undefined>(undefined);
    const [isViewMode, setIsViewMode] = useState(false);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const fetchPermissions = async () => {
        try {
            const res = await fetch("/api/permissions");
            if (res.ok) {
                let data = await res.json();
                // Auto-seed if empty
                if (Array.isArray(data) && data.length === 0) {
                    await fetch("/api/permissions", { method: "POST" });
                    const retryRes = await fetch("/api/permissions");
                    if (retryRes.ok) data = await retryRes.json();
                }
                setPermissions(data);
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            // Assuming API is at /api/role
            const res = await fetch("/api/role");
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
            message.error("Lỗi tải danh sách Role");
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

    const handleEdit = (item: Role) => {
        setEditingItem(item);
        setIsViewMode(false);
        form.setFieldsValue({
            tenRole: item.tenRole,
            moTa: item.moTa
        });
        setIsModalOpen(true);
    };

    const handleView = (item: Role) => {
        setEditingItem(item);
        setIsViewMode(true);
        form.setFieldsValue({
            tenRole: item.tenRole,
            moTa: item.moTa
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/role/${id}`, { method: "DELETE" });
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

            const url = editingItem ? `/api/role/${editingItem.id}` : "/api/role";
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

    const columns: ColumnsType<Role> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Tên Role',
            dataIndex: 'tenRole',
            key: 'tenRole',
            sorter: (a, b) => a.tenRole.localeCompare(b.tenRole),
        },
        {
            title: 'Mô tả',
            dataIndex: 'moTa',
            key: 'moTa',
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
                        title="Xóa Role"
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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Role</h1>
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
                title={isViewMode ? "Chi tiết Role" : (editingItem ? "Sửa Role" : "Thêm Role")}
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
                    <Form.Item
                        name="tenRole"
                        label="Tên Role"
                        rules={[{ required: true, message: 'Vui lòng nhập tên Role' }]}
                    >
                        {isViewMode ? <span className="font-semibold">{editingItem?.tenRole}</span> : <Input placeholder="ADMIN, USER, ..." />}
                    </Form.Item>

                    <Form.Item
                        name="moTa"
                        label="Mô tả"
                    >
                        {isViewMode ? <span className="font-semibold">{editingItem?.moTa}</span> : <Input.TextArea placeholder="Mô tả quyền hạn..." />}
                    </Form.Item>

                    <Form.Item
                        name="permissionIds"
                        label="Phân quyền"
                    >
                        {isViewMode ? (
                            <div className="max-h-60 overflow-y-auto border p-2 rounded">
                                {Object.entries(permissions.reduce((acc, curr) => {
                                    (acc[curr.module] = acc[curr.module] || []).push(curr);
                                    return acc;
                                }, {} as Record<string, Permission[]>)).map(([module, perms]) => (
                                    <div key={module} className="mb-2">
                                        <div className="font-bold text-gray-700">{module}</div>
                                        <div className="ml-4">
                                            {perms.filter(p => editingItem?.permissions?.some(ep => ep.id === p.id)).map(p => (
                                                <div key={p.id}>- {p.name}</div>
                                            ))}
                                            {perms.filter(p => editingItem?.permissions?.some(ep => ep.id === p.id)).length === 0 && <span className="text-gray-400 italic">Không có quyền</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Checkbox.Group style={{ width: '100%' }}>
                                <div className="max-h-96 overflow-y-auto border p-4 rounded bg-gray-50">
                                    {Object.entries(permissions.reduce((acc, curr) => {
                                        (acc[curr.module] = acc[curr.module] || []).push(curr);
                                        return acc;
                                    }, {} as Record<string, Permission[]>)).map(([module, perms]) => (
                                        <div key={module} className="mb-4 break-inside-avoid">
                                            <div className="font-bold text-blue-700 mb-2 border-b pb-1">{module}</div>
                                            <Row gutter={[8, 8]}>
                                                {perms.map(p => (
                                                    <Col span={24} key={p.id}>
                                                        <Checkbox value={p.id}>{p.name}</Checkbox>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    ))}
                                </div>
                            </Checkbox.Group>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
}
