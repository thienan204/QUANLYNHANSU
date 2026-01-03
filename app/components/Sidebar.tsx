"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    BarChartOutlined,
    SettingOutlined,
    UsergroupAddOutlined,
    AppstoreOutlined,
    ApartmentOutlined,
    IdcardOutlined,
    ReadOutlined,
    StarOutlined,
    ManOutlined,
    FileTextOutlined,
    SafetyCertificateOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import * as AntdIcons from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

// Helper for dynamic icons
const getIcon = (name?: string) => {
    if (!name) return null;
    const Icon = (AntdIcons as any)[name];
    return Icon ? <Icon /> : <AppstoreOutlined />;
};

interface ApiMenuItem {
    id: number;
    label: string;
    path: string;
    icon?: string;
    children?: ApiMenuItem[];
    permissionCode?: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const permissions = (session?.user as any)?.permissions || [];

    // Helper to check permission
    const hasPermission = (code: string) => permissions.includes(code);

    // Provide a fallback for ADMIN role to see everything (optional, but good for safety)
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const can = (code: string) => isAdmin || hasPermission(code);

    // Determine selected key based on pathname
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        setSelectedKeys([pathname]);
        if (pathname.startsWith('/danh-muc')) {
            setOpenKeys(['danh-muc']);
        }
    }, [pathname]);

    // Fetch dynamic menu
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch("/api/menu");
                if (res.ok) {
                    const data: ApiMenuItem[] = await res.json();
                    const converted = convertToAntd(data);

                    // Add Settings manually if not in DB, or let DB handle it. 
                    // Seeding included "Menu Builder" but maybe "Cài đặt" general was logical?
                    // For now, let's append "Cài đặt" if strictly needed or trust the seed.
                    // The seed had "Menu Builder" as root item. 
                    // Let's stick to DB data entirely for flexibility, EXCEPT maybe specifically hardcoded logic if needed.
                    // But wait, the seed has "Menu Builder". 
                    setMenuItems(converted);
                }
            } catch (e) { console.error(e); }
        };
        fetchMenu();
    }, [permissions]); // Re-fetch or re-calc if permissions change (logic inside convertToAntd)

    const convertToAntd = (data: ApiMenuItem[]): MenuItem[] => {
        return data.map(item => {
            // Filter by permission
            if (item.permissionCode && !can(item.permissionCode)) return null;

            if (item.children && item.children.length > 0) {
                const children = convertToAntd(item.children); // Recursively
                if (children.length === 0) return null; // Hide parent if no visible children
                return getItem(item.label, item.path === '#' ? `group_${item.id}` : item.path, getIcon(item.icon), children);
            }
            return getItem(item.label, item.path, getIcon(item.icon));
        }).filter(Boolean) as MenuItem[];
    };

    const onClick: MenuProps['onClick'] = (e) => {
        router.push(e.key);
    };

    return (
        <aside
            className={`${collapsed ? 'w-20' : 'w-64'} bg-white shadow-md min-h-screen flex flex-col transition-all duration-300`}
        >
            <div className="h-16 flex items-center justify-between px-4 border-b">
                {!collapsed && (
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="HR Logo"
                            width={120}
                            height={40}
                            className="object-contain h-10 w-auto"
                            priority
                        />
                    </Link>
                )}
                <div
                    className="cursor-pointer text-gray-500 hover:text-blue-600 text-lg transition-colors"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <Menu
                    onClick={onClick}
                    style={{ width: '100%', borderRight: 0 }}
                    defaultSelectedKeys={['/']}
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    onOpenChange={(keys) => setOpenKeys(keys)}
                    mode="inline"
                    items={menuItems}
                    inlineCollapsed={collapsed}
                />
            </div>
            <div className="p-4 border-t text-xs text-gray-500 text-center">
                v1.0.0
            </div>
        </aside>
    );
}
