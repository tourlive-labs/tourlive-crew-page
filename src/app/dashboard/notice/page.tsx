"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Megaphone, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const notices = [
    {
        id: 1,
        title: "투어라이브 크루 14기 활동 가이드 안내",
        date: "2026.03.30",
        category: "활동가이드",
        isNew: true
    },
    {
        id: 2,
        title: "3월 미션 제출 기한 및 주의사항 공지",
        date: "2026.03.25",
        category: "미션공지",
        isNew: false
    },
    {
        id: 3,
        title: "오디오 가이드 사용법 및 리뷰 작성 팁",
        date: "2026.03.20",
        category: "교육자료",
        isNew: false
    }
];

export default function NoticePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-12 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5C00] shadow-sm shadow-orange-100">
                        <Bell className="w-6 h-6" />
                    </div>
                    공지사항
                </h1>
                <p className="text-lg font-bold text-slate-400 ml-16">투어라이브 크루 활동의 중요한 소식을 확인하세요.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {notices.map((notice) => (
                    <Card key={notice.id} className="rounded-3xl border-slate-100 group cursor-pointer hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden bg-white">
                        <CardContent className="p-0">
                            <div className="flex items-center p-8 gap-8">
                                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#FFF5F1] group-hover:text-[#FF5C00] transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Date</span>
                                    <span className="text-sm font-black leading-none">{notice.date.split('.')[2]}</span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-[10px] font-black px-3 py-1 rounded-full border-slate-200 text-slate-400 uppercase tracking-widest">{notice.category}</Badge>
                                        {notice.isNew && <Badge className="bg-[#FF5C00] text-white hover:bg-[#FF5C00] text-[10px] font-black px-3 py-1 rounded-full">NEW</Badge>}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 group-hover:text-slate-900 transition-colors tracking-tight">{notice.title}</h3>
                                </div>
                                <ArrowRight className="w-6 h-6 text-slate-200 group-hover:text-[#FF5C00] group-hover:translate-x-2 transition-all" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                <Megaphone className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-black text-sm uppercase tracking-widest italic">No more recent announcements</p>
            </div>
        </div>
    );
}
