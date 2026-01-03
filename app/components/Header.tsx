"use client";

import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="bg-gradient-to-r from-orange-400 to-pink-500 shadow-md h-16 flex items-center justify-between px-6 z-10">
            {/* Search Bar - Demo visual */}
            <div className="flex items-center bg-white/20 rounded-full px-4 py-1.5 text-white placeholder-white placeholder-opacity-70 focus-within:bg-white/30 transition-colors w-96">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-white placeholder-white/70 ml-2 w-full text-sm"
                />
            </div>

            {/* Right Side: Notifications, Profile, Logout */}
            <div className="flex items-center space-x-4 text-white">
                <button className="p-1 hover:bg-white/10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                <div className="flex items-center space-x-2">
                    <div className="bg-white/20 h-8 w-8 rounded-full flex items-center justify-center">
                        <span className="font-bold uppercase text-sm">{session?.user?.name?.[0] || "U"}</span>
                    </div>
                    <span className="text-sm font-medium">{session?.user?.name || "Người dùng"}</span>
                </div>

                <div className="border-l border-white/30 pl-4 h-6 flex items-center">
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}
