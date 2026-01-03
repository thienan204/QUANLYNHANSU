'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline transition-colors"
        >
            Đăng xuất
        </button>
    );
}
