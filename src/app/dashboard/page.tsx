"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    PartyPopper,
    CheckCircle2,
    Calendar as CalendarIcon,
    LayoutDashboard,
    FileText,
    Bell,
    Users,
    ChevronRight,
    ExternalLink,
    Clock
} from "lucide-react";
import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";

function DashboardHeader({ nickname, term, dDay }: { nickname: string, term: number, dDay: number }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    반갑습니다, <span className="text-orange-600">{nickname}</span>님!
                </h1>
                <p className="text-gray-600 mt-1">
                    {term}기 활동의 <span className="font-bold text-gray-900">{dDay}</span>일째입니다.
                </p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50">
                    <Bell className="w-4 h-4 mr-2" />
                    공지사항
                </Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    오늘의 투두
                </Button>
            </div>
        </div>
    );
}

function ActivityStepper({ missions }: { missions: any[] }) {
    return (
        <Card className="mb-8 border-orange-100 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-orange-600" />
                    3 Essential Missions
                </CardTitle>
                <span className="text-sm text-gray-500 font-normal">필수 미션 현황</span>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0" />
                    {missions.map((mission, idx) => (
                        <div key={mission.id} className="relative z-10 flex flex-col items-center group">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                mission.completed
                                    ? "bg-orange-600 border-orange-600 text-white"
                                    : "bg-white border-gray-200 text-gray-400 group-hover:border-orange-300"
                            )}>
                                {mission.completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className={cn(
                                "mt-2 text-sm font-medium",
                                mission.completed ? "text-orange-600" : "text-gray-500"
                            )}>{mission.title}</span>
                        </div>
                    ))}
                    {missions.length === 0 && (
                        <div className="w-full text-center py-4 text-gray-400 italic">
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
        <Card className="border-orange-100 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-orange-600" />
                    활동 캘린더
                </CardTitle>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        <span className="text-xs text-gray-500">필수</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs text-gray-500">일반</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 px-4">
                <div className="text-center mb-4 font-bold text-gray-700">
                    {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
                </div>
                <div className="grid grid-cols-7 gap-px mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {blanks.map(i => <div key={`blank-${i}`} className="h-14 md:h-20" />)}
                    {days.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = today.getDate() === day &&
                            today.getMonth() === viewDate.getMonth() &&
                            today.getFullYear() === viewDate.getFullYear();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-14 md:h-20 border border-gray-50 rounded-lg p-1 transition-all cursor-pointer hover:bg-orange-50/30",
                                    isToday && "bg-orange-50/50 border-orange-200"
                                )}
                                onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                            >
                                <span className={cn(
                                    "text-xs font-medium ml-1",
                                    isToday ? "text-orange-600 font-bold" : "text-gray-500"
                                )}>{day}</span>
                                <div className="mt-1 flex flex-col gap-0.5">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "h-1.5 md:h-2 rounded-full mx-0.5",
                                                event.is_essential ? "bg-orange-500" : "bg-blue-400"
                                            )}
                                            title={event.title}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedEvent && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                selectedEvent.is_essential ? "bg-orange-200 text-orange-800" : "bg-blue-200 text-blue-800"
                            )}>
                                {selectedEvent.type === 'mission' ? '필수 미션' : '이벤트'}
                            </span>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Clock className="w-4 h-4" />
                            </button>
                        </div>
                        <h4 className="font-bold text-gray-900">{selectedEvent.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                        <div className="mt-3 flex items-center text-xs text-orange-700 font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            마감일: {new Date(selectedEvent.scheduled_at).toLocaleDateString()}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickLinks() {
    const links = [
        { title: "활동 가이드", desc: "미션 제출 및 활동 주의사항", icon: FileText, href: "#" },
        { title: "공식 커뮤니티", desc: "크루들간의 소통 공간", icon: Users, href: "#" },
        { title: "관리자 문의", desc: "활동 중 궁금한 점 문의", icon: ExternalLink, href: "#" }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {links.map(link => (
                <Link href={link.href} key={link.title} className="group">
                    <Card className="hover:border-orange-300 transition-all duration-300 bg-white shadow-sm h-full">
                        <CardContent className="p-5 flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                                <link.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {link.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
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
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4" />
                <p className="text-orange-900/60 font-medium">대시보드를 불러오는 중...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">대시보드 접근 오류</h3>
                <p className="text-gray-500 mt-1">로그인 정보가 없거나 프로필을 찾을 수 없습니다.</p>
                <Button asChild className="mt-6 bg-orange-600 hover:bg-orange-700">
                    <Link href="/">홈으로 가기</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <DashboardHeader
                nickname={data.nickname}
                term={data.term}
                dDay={data.dDay}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <ActivityStepper missions={data.essentialMissions} />
                    <Card className="border-orange-100 shadow-sm bg-white overflow-hidden">
                        <div className="h-2 bg-orange-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">내 활동 요약</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">진행한 미션</span>
                                <span className="font-bold text-gray-900 text-lg">0 / 3</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">포인트</span>
                                <span className="font-bold text-orange-600 text-lg">1,200 P</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <EventCalendar schedules={data.schedules} />
                    <QuickLinks />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-orange-50/20">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </div>
    );
}
