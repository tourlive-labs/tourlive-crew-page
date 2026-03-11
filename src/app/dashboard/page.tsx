"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    CheckCircle2,
    Calendar as CalendarIcon,
    FileText,
    Bell,
    Users,
    ExternalLink,
    Clock,
    User,
    ArrowRight,
    Trophy,
    Target
} from "lucide-react";
import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";

function DashboardHeader({ nickname, term, dDay }: { nickname: string, term: number, dDay: number }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        반갑습니다, <span className="text-[#FF5C00]">{nickname}</span>님!
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="px-3 py-1 rounded-full bg-[#F0F5FF] text-[#0052CC] text-xs font-bold border border-[#D6E4FF]">
                            {term}기 공식 크루
                        </span>
                        <p className="text-slate-500 text-sm font-medium">
                            활동 <span className="text-slate-800 font-bold">{dDay}</span>일차입니다
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all">
                    <Bell className="w-4 h-4 mr-2" />
                    공지사항
                </Button>
                <Button className="h-12 rounded-2xl bg-[#FF5C00] hover:bg-[#E65300] text-white font-bold shadow-lg shadow-orange-100 transition-all hover:scale-[1.02]">
                    미션 제출하기
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}

function ActivityStepper({ missions }: { missions: any[] }) {
    return (
        <Card className="mb-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white p-2">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
                    <Target className="w-6 h-6 mr-3 text-[#FF5C00]" />
                    3 Essential Missions
                </CardTitle>
                <div className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100 uppercase tracking-wider">
                    Progress
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <div className="relative flex justify-between items-start pt-4 px-4 pb-2">
                    <div className="absolute top-[36px] left-[10%] w-[80%] h-1 bg-slate-50 -z-0 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#FFD6E0] to-[#D6E4FF] transition-all duration-1000"
                            style={{ width: `${(missions.filter(m => m.completed).length / Math.max(missions.length, 1)) * 100}%` }}
                        />
                    </div>
                    {missions.map((mission, idx) => {
                        const pastelColors = ["bg-[#FFD6E0]", "bg-[#F0F5FF]", "bg-[#D6E4FF]"];
                        const accentColors = ["text-[#E63946]", "text-[#0052CC]", "text-[#0052CC]"];

                        return (
                            <div key={mission.id} className="relative z-10 flex flex-col items-center group max-w-[100px] text-center">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-md transition-all duration-500",
                                    mission.completed
                                        ? cn(pastelColors[idx % 3], "scale-110")
                                        : "bg-slate-50 border-white text-slate-300 group-hover:bg-white group-hover:border-slate-100"
                                )}>
                                    {mission.completed
                                        ? <CheckCircle2 className={cn("w-6 h-6", accentColors[idx % 3])} />
                                        : <span className="font-black text-lg">{idx + 1}</span>
                                    }
                                </div>
                                <span className={cn(
                                    "mt-4 text-sm font-bold leading-tight line-clamp-2",
                                    mission.completed ? "text-slate-800" : "text-slate-400"
                                )}>{mission.title}</span>
                            </div>
                        );
                    })}
                    {missions.length === 0 && (
                        <div className="w-full text-center py-8 text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            등록된 필수 미션이 없습니다.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function EventCalendar({ schedules }: { schedules: any[] }) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getEventsForDay = (day: number) => {
        return schedules.filter(s => {
            const date = new Date(s.scheduled_at);
            return date.getDate() === day &&
                date.getMonth() === viewDate.getMonth() &&
                date.getFullYear() === viewDate.getFullYear();
        });
    };

    return (
        <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white p-2">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
                    <CalendarIcon className="w-6 h-6 mr-3 text-[#FF5C00]" />
                    활동 캘린더
                </CardTitle>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFD6E0]" />
                        <span className="text-xs text-slate-400 font-bold">필수</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#D6E4FF]" />
                        <span className="text-xs text-slate-400 font-bold">이벤트</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="text-2xl font-black text-slate-800 tracking-tighter">
                        {viewDate.getFullYear()}. {String(viewDate.getMonth() + 1).padStart(2, '0')}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 p-0 rounded-xl border-slate-100 text-slate-400 hover:text-slate-800 transition-all font-bold"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                        >
                            &lt;
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-10 h-10 p-0 rounded-xl border-slate-100 text-slate-400 hover:text-slate-800 transition-all font-bold"
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                        >
                            &gt;
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-px mb-4 border-b border-slate-50 pb-2">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center text-[10px] font-black text-slate-300 py-2 tracking-widest">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {blanks.map(i => <div key={`blank-${i}`} className="h-20" />)}
                    {days.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = today.getDate() === day &&
                            today.getMonth() === viewDate.getMonth() &&
                            today.getFullYear() === viewDate.getFullYear();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-20 border border-slate-50 rounded-2xl p-2 transition-all cursor-pointer group hover:bg-slate-50 hover:shadow-inner",
                                    isToday && "bg-[#F0F5FF]/50 border-[#D6E4FF]"
                                )}
                                onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                            >
                                <span className={cn(
                                    "text-sm font-bold block mb-1",
                                    isToday ? "text-[#0052CC]" : "text-slate-400 group-hover:text-slate-600"
                                )}>{day}</span>
                                <div className="space-y-1">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "h-1.5 rounded-full w-full",
                                                event.is_essential ? "bg-[#FFD6E0]" : "bg-[#D6E4FF]"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedEvent && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-[28px] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                        <div className={cn(
                            "absolute top-0 left-0 w-2 h-full",
                            selectedEvent.is_essential ? "bg-[#FFD6E0]" : "bg-[#D6E4FF]"
                        )} />
                        <div className="flex items-center justify-between mb-4">
                            <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                selectedEvent.is_essential
                                    ? "bg-[#FFF0F3] border-[#FFD6E0] text-[#E63946]"
                                    : "bg-[#F0F5FF] border-[#D6E4FF] text-[#0052CC]"
                            )}>
                                {selectedEvent.type === 'mission' ? 'Essential Mission' : 'General Event'}
                            </span>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-slate-300 hover:text-slate-500 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 leading-tight">{selectedEvent.title}</h4>
                        <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">{selectedEvent.description}</p>
                        <div className="mt-6 flex items-center text-xs text-slate-400 font-bold bg-white/50 w-fit px-4 py-2 rounded-xl backdrop-blur-sm">
                            <Clock className="w-4 h-4 mr-2 text-slate-300" />
                            Deadline: <span className="text-slate-600 ml-1">{new Date(selectedEvent.scheduled_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickLinks() {
    const links = [
        { title: "활동 가이드", desc: "미션 제출 및 주의사항", icon: FileText, href: "#", color: "bg-[#FFF0F3] text-[#E63946]" },
        { title: "공식 커뮤니티", desc: "크루들간의 소통 공간", icon: Users, href: "#", color: "bg-[#F0F5FF] text-[#0052CC]" },
        { title: "관리자 문의", desc: "궁금한 점 실시간 문의", icon: ExternalLink, href: "#", color: "bg-slate-100 text-slate-500" }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {links.map(link => (
                <Link href={link.href} key={link.title} className="group outline-none">
                    <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transform hover:-translate-y-1 transition-all duration-500 border-none rounded-[28px] bg-white h-full p-2">
                        <CardContent className="p-6 flex items-center gap-5">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", link.color)}>
                                <link.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-800 text-base leading-tight">
                                    {link.title}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    {link.desc}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}

function DashboardContent() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const res = await getDashboardData();
            if ('error' in res) {
                console.error(res.error);
            } else {
                setData(res);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-[#F8F9FA] rounded-[40px] border border-slate-100 shadow-inner">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-[#FFD6E0] animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin" />
                    </div>
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Initializing Dashboard</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col items-center">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mb-6">
                    <Trophy className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">접근할 수 없습니다</h3>
                <p className="text-slate-400 font-medium mt-2 max-w-sm">로그인 세션이 만료되었거나<br />등록된 프로필 정보를 찾을 수 없습니다.</p>
                <Button asChild className="mt-10 h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all hover:scale-105">
                    <Link href="/login">다시 로그인하기</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <DashboardHeader
                nickname={data.nickname}
                term={data.term}
                dDay={data.dDay}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-10">
                    <ActivityStepper missions={data.essentialMissions} />
                    <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white p-2">
                        <div className="h-2 bg-gradient-to-r from-[#FFD6E0] via-[#F0F5FF] to-[#D6E4FF]" />
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-extrabold text-slate-800 tracking-tight">내 활동 현황</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="p-4 rounded-[24px] bg-slate-50 flex justify-between items-center transition-all hover:bg-slate-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#E63946] shadow-sm">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 tracking-tight">미션 진행률</span>
                                </div>
                                <span className="font-black text-slate-800 text-lg">
                                    {data.essentialMissions.filter((m: any) => m.completed).length} / {data.essentialMissions.length}
                                </span>
                            </div>
                            <div className="p-4 rounded-[24px] bg-slate-50 flex justify-between items-center transition-all hover:bg-slate-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#0052CC] shadow-sm">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 tracking-tight">보유 크루 포인트</span>
                                </div>
                                <span className="font-black text-[#FF5C00] text-lg">1,200 P</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-8">
                    <EventCalendar schedules={data.schedules} />
                    <QuickLinks />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] selection:bg-[#FF5C00] selection:text-white">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-[32px] bg-white shadow-xl animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-4 border-[#FF5C00] border-t-transparent animate-spin" />
                        </div>
                    </div>
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </div>
    );
}
