"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserModal from "../../components/UserModal";
import { Table, Button, Space, Input, Popconfirm, message, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

interface User {
    id: number;
    username: string;
    role: string;
}

export default function UserManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    // Filters
    const [filters, setFilters] = useState({
        username: "",
        role: "",
    });

    // Fetch users function
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                setFilteredUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            message.error("Lỗi tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Protect route
        if (status === "unauthenticated") {
            router.push("/dang-nhap");
        } else if (status === "authenticated") {
            // Check role ADMIN
            if ((session?.user as any)?.role !== "ADMIN") {
                router.push("/"); // Redirect if not admin
                return;
            }
            fetchUsers();
        }
    }, [status, session, router]);

    // Filter logic
    useEffect(() => {
        const lowerUsername = filters.username.toLowerCase();
        const lowerRole = filters.role.toLowerCase();

        const filtered = users.filter(user => {
            const matchUsername = (user.username || "").toLowerCase().includes(lowerUsername);
            const matchRole = (user.role || "").toLowerCase().includes(lowerRole);
            return matchUsername && matchRole;
        });
        setFilteredUsers(filtered);
    }, [filters, users]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                message.success("Xóa thành công");
                fetchUsers();
            } else {
                message.error("Xóa thất bại");
            }
        } catch (error) {
            console.error("Delete error", error);
            message.error("Có lỗi xảy ra");
        }
    };

    const handleSave = () => {
        fetchUsers();
    };

    if (status === "loading" || isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
    }

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

    const columns: ColumnsType<User> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: renderHeader('Tên đăng nhập', 'username'),
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: renderHeader('Vai trò', 'role'),
            dataIndex: 'role',
            key: 'role',
            width: 150,
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'purple' : 'green'}>
                    {role}
                </Tag>
            ),
            sorter: (a, b) => a.role.localeCompare(b.role),
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
                        icon={<EditOutlined />}
                        className="text-blue-600"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn có chắc chắn muốn xóa người dùng này?"
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

    if ((session?.user as any)?.role !== "ADMIN") return null;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý User</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                    className="bg-green-600 hover:bg-green-700"
                >
                    Thêm Người dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={isLoading}
                bordered
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 800 }}
            />

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                user={editingUser}
            />
        </div>
    );
}
