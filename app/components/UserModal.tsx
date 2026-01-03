"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { FORM_ITEM_STYLE } from "@/lib/form-config";

interface User {
    id?: number;
    username: string;
    role: string;
    roleId?: number;
}

interface Role {
    id: number;
    tenRole: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    user?: User;
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch("/api/role");
                if (res.ok) {
                    const data = await res.json();
                    setRoles(data);
                }
            } catch (error) {
                console.error("Failed to fetch roles", error);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                form.setFieldsValue({
                    username: user.username,
                    roleId: user.roleId,
                    password: "", // Reset password field
                });
            } else {
                form.resetFields();
                // form.setFieldsValue({ role: "USER" }); // Default role removed or set to specific ID if needed
            }
        }
    }, [user, isOpen, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            const url = user ? `/api/users/${user.id}` : "/api/users";
            const method = user ? "PUT" : "POST";

            // Only send password if it's provided or if it's a new user (handled by required rule)
            const payload = {
                username: values.username,
                roleId: values.roleId,
                ...(values.password ? { password: values.password } : {}),
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Có lỗi xảy ra");
            }

            message.success(user ? "Cập nhật thành công!" : "Thêm mới thành công!");
            onSave();
            onClose();
        } catch (err: any) {
            message.error(err.message || "Có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title={user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            open={isOpen}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={isLoading}
            okText={user ? "Lưu thay đổi" : "Lưu"}
            cancelText="Hủy"
            centered
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                labelAlign="left"
                className="mt-4"
            >
                <Form.Item style={FORM_ITEM_STYLE}
                    name="username"
                    label="Tên đăng nhập"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                >
                    <Input disabled={!!user} />
                </Form.Item>

                <Form.Item style={FORM_ITEM_STYLE}
                    name="password"
                    label={user ? "Mật khẩu (Để trống nếu không đổi)" : "Mật khẩu"}
                    rules={[{ required: !user, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item style={FORM_ITEM_STYLE}
                    name="roleId"
                    label="Vai trò"
                    rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                >
                    <Select placeholder="Chọn vai trò">
                        {roles.map(role => (
                            <Select.Option key={role.id} value={role.id}>
                                {role.tenRole}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
