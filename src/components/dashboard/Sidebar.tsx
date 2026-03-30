"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Home, 
    Bell, 
    Trophy, 
    FileText, 
    User, 
    LogOut, 
    Menu, 
    X,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const menuItems = [
    { name: "Overview", label: "대시보드 홈", icon: Home, href: "/dashboard" },
    { name: "Notice", label: "공지사항", icon: Bell, href: "/dashboard/notice" },
    { name: "Challenge", label: "이달의 챌린지", icon: Trophy, href: "/dashboard/challenge" },
    { name: "Mission", label: "필수 활동 제출", icon: FileText, href: "/dashboard/mission" },
    { name: "MyPage", label: "마이페이지", icon: User, href: "/dashboard/mypage" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/login";
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5C00] to-[#E63900] flex items-center justify-center">
                        <span className="text-white font-black text-sm">T</span>
                    </div>
                    <span className="font-extrabold text-slate-900 tracking-tight">Tourlive Crew</span>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
            </div>

            {/* Sidebar Sidebar Container */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-100 z-50 transition-all duration-300 transform lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full p-8 pt-10 lg:pt-10">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 mb-12 ml-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5C00] to-[#E63900] flex items-center justify-center shadow-lg shadow-orange-100">
                            <span className="text-white font-black text-lg">T</span>
                        </div>
                        <div>
                            <span className="block font-black text-slate-900 leading-tight">Tourlive Crew</span>
                            <span className="block text-[10px] font-black text-[#FF5C00] uppercase tracking-widest mt-0.5">Portal v2.0</span>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            
                            return (
                                <Link 
                                    key={item.name} 
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center group px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                        isActive 
                                            ? "bg-[#FFF5F1] text-[#FF5C00]" 
                                            : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF5C00] rounded-r-full" />
                                    )}
                                    <Icon className={cn(
                                        "w-5 h-5 mr-4 transition-colors",
                                        isActive ? "text-[#FF5C00]" : "text-slate-400 group-hover:text-slate-900"
                                    )} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    {isActive && (
                                        <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Area with Logout */}
                    <div className="mt-auto border-t border-slate-50 pt-8">
                        <button 
                            onClick={handleSignOut}
                            className="flex items-center w-full px-5 py-4 text-slate-400 hover:text-red-500 transition-colors font-bold text-sm group"
                        >
                            <LogOut className="w-5 h-5 mr-4 group-hover:translate-x-1 transition-transform" />
                            로그아웃
                        </button>
                        <div className="mt-6 px-5 py-6 rounded-2xl bg-slate-50 flex items-center gap-3 border border-slate-100">
                             <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                             <div className="overflow-hidden">
                                 <span className="block text-[11px] font-black text-slate-800 leading-none">Tourlive Admin</span>
                                 <span className="block text-[10px] font-bold text-slate-400 mt-1 leading-none">Support Center</span>
                             </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
