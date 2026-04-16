"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, ArrowRight, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";

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
            <PageHeader
                icon={Bell}
                title="공지사항"
                subtitle="투어라이브 크루 활동의 중요한 소식을 확인하세요."
            />

            <div className="grid grid-cols-1 gap-6">
                {notices.map((notice) => (
                    <Card key={notice.id} className="rounded-brand border-slate-100 group cursor-pointer hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden bg-white">
                        <CardContent className="p-0">
                            <div className="flex items-center p-8 gap-8">
                                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#FFF5F1] group-hover:text-brand-primary transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Date</span>
                                    <span className="text-sm font-black leading-none">{notice.date.split('.')[2]}</span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-[10px] font-black px-3 py-1 rounded-full border-slate-200 text-slate-400 uppercase tracking-widest">{notice.category}</Badge>
                                        {notice.isNew && <Badge className="bg-brand-primary text-white hover:bg-brand-primary text-[10px] font-black px-3 py-1 rounded-full">NEW</Badge>}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 group-hover:text-slate-900 transition-colors tracking-tight">{notice.title}</h3>
                                </div>
                                <ArrowRight className="w-6 h-6 text-slate-200 group-hover:text-brand-primary group-hover:translate-x-2 transition-all" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-brand-xl border border-dashed border-slate-200">
                <Megaphone className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-black text-sm uppercase tracking-widest italic">No more recent announcements</p>
            </div>
        </div>
    );
}
