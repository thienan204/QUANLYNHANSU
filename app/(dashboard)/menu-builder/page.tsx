
"use client";

import { useEffect, useState } from "react";
import { Tree, SerializedStyles, Button, Modal, Form, Input, Select, message, Space, Popconfirm, InputNumber } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import * as AntdIcons from "@ant-design/icons";

// Helper to render icons dynamically
const DynamicIcon = ({ iconName }: { iconName: string }) => {
    const Icon = (AntdIcons as any)[iconName];
    return Icon ? <Icon /> : null;
};

interface MenuItem {
    id: number;
    label: string;
    path: string;
    icon?: string;
    parentId?: number | null;
    order: number;
    permissionCode?: string;
    children?: MenuItem[];
    key?: number; // For Tree
    title?: React.ReactNode; // For Tree
}

export default function MenuBuilderPage() {
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [originalData, setOriginalData] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [form] = Form.useForm();
    const [permissionOptions, setPermissionOptions] = useState<any[]>([]);

    // Load Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/menu");
            if (res.ok) {
                const data = await res.json();
                setOriginalData(data);
                const tree = convertToTreeData(data);
                setTreeData(tree);
            }
        } catch (e) {
            message.error("Lỗi tải menu");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await fetch("/api/permissions");
            if (res.ok) setPermissionOptions(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchData();
        fetchPermissions();
    }, []);

    // Convert API data to TreeData
    const convertToTreeData = (items: MenuItem[]): DataNode[] => {
        return items.map(item => ({
            key: item.id,
            title: (
                <div className="flex justify-between items-center group w-full pr-4 gap-4">
                    <span className="flex items-center gap-2">
                        {item.icon && <DynamicIcon iconName={item.icon} />}
                        <span className="font-medium">{item.label}</span>
                        <span className="text-gray-400 text-xs">({item.path})</span>
                    </span>
                    <Space className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="small" icon={<PlusOutlined />} onClick={(e) => { e.stopPropagation(); handleAdd(item.id); }} />
                        <Button size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(item); }} />
                        <Popconfirm title="Xóa menu?" onConfirm={(e) => { e?.stopPropagation(); handleDelete(item.id); }}>
                            <Button size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                        </Popconfirm>
                    </Space>
                </div>
            ),
            children: item.children ? convertToTreeData(item.children) : [],
        }));
    };

    // Drag and Drop Handler
    const onDrop: TreeProps['onDrop'] = async (info) => {
        const dropKey = info.node.key;
        const dragKey = info.dragNode.key;
        const dropPos = info.node.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data: DataNode[], key: React.Key, callback: (item: DataNode, index: number, arr: DataNode[]) => void) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children!, key, callback);
                }
            }
        };
        const data = [...treeData];

        // Find dragObject
        let dragObj: DataNode;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop inside
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.push(dragObj);
            });
        } else if ((info.node.children || []).length > 0 && // Has children
            info.node.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj);
            });
        } else {
            let ar: DataNode[] = [];
            let i: number;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i!, 0, dragObj!);
            } else {
                ar.splice(i! + 1, 0, dragObj!);
            }
        }

        setTreeData(data);
        // Persist changes
        await saveReorder(data);
    };

    const saveReorder = async (tree: DataNode[], parentId: number | null = null) => {
        // Flatten to prepare for bulk update
        const updates: any[] = [];
        tree.forEach((node, index) => {
            updates.push({ id: node.key, order: index, parentId });
            if (node.children) {
                // Recursively collect children updates
                // Note: In real app, we might just send the tree structure and let backend parse
                // OR send individual updates.
                // For simplicity, let's just trigger a backend "SYNC" or recursive update.
                // But `saveReorder` logic needs to recurse.
                // Wait, logic above only collects top level.
            }
        });

        // Actually, let's create a recursive helper to collect ALL updates
        const allUpdates: any[] = [];
        const traverse = (nodes: DataNode[], pid: number | null) => {
            nodes.forEach((n, idx) => {
                allUpdates.push({ id: n.key, order: idx, parentId: pid });
                if (n.children) traverse(n.children, Number(n.key));
            });
        }
        traverse(tree, null);

        try {
            await fetch("/api/menu", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(allUpdates)
            });
            message.success("Đã lưu cấu trúc menu");
        } catch (e) { message.error("Lỗi lưu"); }
    };

    // CRUD
    const handleAdd = (parentId?: number) => {
        setEditingItem(null);
        form.resetFields();
        if (parentId) form.setFieldValue('parentId', parentId);
        setIsModalOpen(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await fetch(`/api/menu/${id}`, { method: "DELETE" });
            message.success("Đã xóa");
            fetchData();
        } catch (e) { message.error("Lỗi xóa"); }
    };

    const handleSave = async () => {
        const values = await form.validateFields();
        const url = "/api/menu";
        const method = editingItem ? "PUT" : "POST";
        const body = { ...values, id: editingItem?.id };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                message.success("Thành công");
                setIsModalOpen(false);
                fetchData();
            } else message.error("Lỗi");
        } catch (e) { message.error("Lỗi"); }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Menu Builder</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>Thêm Menu gốc</Button>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <Tree
                    className="draggable-tree"
                    draggable
                    blockNode
                    onDrop={onDrop}
                    treeData={treeData}
                    defaultExpandAll
                />
                {treeData.length === 0 && !isLoading && <div className="text-center text-gray-400 py-8">Chưa có menu nào</div>}
            </div>

            <Modal
                title={editingItem ? "Sửa Menu" : "Thêm Menu"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="label" label="Tên hiển thị" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="path" label="Đường dẫn (URL)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="icon" label="Icon (Ant Design Icon Name)">
                        <Select showSearch>
                            {Object.keys(AntdIcons).filter(k => k.endsWith('Outlined')).map(icon => (
                                <Select.Option key={icon} value={icon}>
                                    <Space><DynamicIcon iconName={icon} /> {icon}</Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="permissionCode" label="Quyền truy cập (Optional)">
                        <Select allowClear>
                            {permissionOptions.map((p: any) => (
                                <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="parentId" label="Parent ID" hidden>
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
