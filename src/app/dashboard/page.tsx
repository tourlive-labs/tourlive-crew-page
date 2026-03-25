"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    Target,
    AlertCircle,
    Check,
    Coffee,
    BookOpen,
    Quote,
    HelpCircle,
    Star
} from "lucide-react";
import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { submitMission } from "@/app/actions/mission";
import { getCalendarStamps } from "@/app/actions/calendar";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function MonthlyMissionCard({ currentMission }: { currentMission: any }) {
    const router = useRouter();
    const currentMonth = new Date().getMonth() + 1;
    
    // Calculate progress (this is a placeholder until real mission data is integrated)
    // For now, let's assume 1 mission submitted = 100% for the summary view
    const progress = (currentMission?.status && currentMission.status !== 'none') ? 100 : 0;

    return (
        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white p-2">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-black text-slate-800 tracking-tight">
                        {currentMonth}월 미션 현황
                    </CardTitle>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500">이번 달 필수 활동 {progress}% 완료</span>
                        <span className="text-xs font-black text-[#FF5C00]">{progress}/100%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#FF5C00] transition-all duration-700 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4">
                <Button 
                    asChild
                    className="h-14 w-full rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black shadow-lg shadow-orange-100/50 transition-all hover:scale-[1.02]"
                >
                    <Link href="/dashboard/mission" className="flex items-center justify-center gap-2">
                        필수 활동 제출하러 가기
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}


function DashboardHeader({ nickname, role }: { nickname: string, role: string }) {
    return (
        <div className="flex items-center justify-between mb-16">
            <h1 className="text-[25px] font-black text-slate-900 tracking-tight leading-tight">
                투어라이브 크루 <span className="text-[#FF5C00]">{nickname}</span>님의 대시보드
            </h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Tourlive Crew</span>
                    <span className="w-px h-3 bg-slate-200 mx-1" />
                    <span className="text-sm font-black text-slate-800 leading-none">14기</span>
                </div>
                {role === 'admin' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="border-[#FF5C00] text-[#FF5C00] hover:bg-[#FF5C00] hover:text-white font-black rounded-xl text-xs h-9 px-4"
                    >
                        <Link href="/admin/missions">관리자 페이지</Link>
                    </Button>
                )}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => signOut()}
                    className="text-slate-400 hover:text-slate-900 font-bold text-xs"
                >
                    로그아웃
                </Button>
            </div>
        </div>
    );
}

function TeamMissionList({ team }: { team: string }) {
    const isCafe = team === 'naver_cafe';
    const currentMonth = new Date().getMonth() + 1;
    const teamName = isCafe ? "네이버 지식카페 활동" : "네이버 블로그 활동";
    const [showGuidelines, setShowGuidelines] = useState(false);

    return (
        <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white p-2">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight whitespace-nowrap">
                        {isCafe ? <Coffee className="w-6 h-6 mr-3 text-[#FF5C00]" /> : <BookOpen className="w-6 h-6 mr-3 text-[#0052CC]" />}
                        {currentMonth}월 미션 현황
                    </CardTitle>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 whitespace-nowrap">
                        {teamName}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <CardDescription className="text-slate-500 font-medium truncate">
                        기한 내에 지정된 미션을 완료해 주세요.
                    </CardDescription>
                    <button
                        onClick={() => setShowGuidelines(!showGuidelines)}
                        className="text-[10px] font-black text-[#FF5C00] hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                        <AlertCircle className="w-3 h-3" />
                        {showGuidelines ? "가이드 접기" : "가이드라인 보기"}
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
                {showGuidelines && (
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <h4 className="text-xs font-black text-orange-800 mb-2 flex items-center gap-2 uppercase tracking-widest">
                            <Target className="w-3 h-3 text-orange-500" />
                            Activity Guidelines
                        </h4>
                        <ul className="space-y-1.5">
                            {isCafe ? (
                                <>
                                    <li className="text-[11px] text-orange-700 font-bold flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                        정보글 5건 및 댓글 30건 필수 참여
                                    </li>
                                    <li className="text-[11px] text-orange-700 font-bold flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                        가이드북 후기 작성 시 이미지 5장 이상
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="text-[11px] text-orange-700 font-bold flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                        월 2건 오디오가이드/가이드북 후기 작성
                                    </li>
                                    <li className="text-[11px] text-orange-700 font-bold flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                        필수 멘트 및 UTM 소스 링크 삽입 필수
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                )}
                {isCafe ? (
                    <>
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm text-xs font-black shrink-0">01</span>
                                <span className="text-sm font-bold text-slate-700 truncate whitespace-nowrap">여행 정보 게시글 등록</span>
                            </div>
                            <span className="font-black text-slate-800 ml-4 shrink-0 whitespace-nowrap">0 / 5개</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm text-xs font-black shrink-0">02</span>
                                <span className="text-sm font-bold text-slate-700 truncate whitespace-nowrap">커뮤니티 댓글 활동</span>
                            </div>
                            <span className="font-black text-slate-800 ml-4 shrink-0 whitespace-nowrap">0 / 30개</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#FFF5F1] border border-[#FFD9C6] flex items-center justify-between text-[#FF5C00] group hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="w-8 h-8 rounded-xl bg-[#FF5C00] flex items-center justify-center text-white shadow-sm text-xs font-black shrink-0">03</span>
                                <span className="text-sm font-black truncate whitespace-nowrap">가이드북 사용후기글</span>
                            </div>
                            <span className="font-black ml-4 shrink-0 whitespace-nowrap">0 / 1개</span>
                        </div>
                    </>
                ) : (
                    <div className="p-6 rounded-3xl bg-[#F0F5FF]/30 border border-[#D6E4FF] flex items-center justify-between text-[#0052CC] group hover:bg-white hover:shadow-lg transition-all duration-500">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0052CC] shadow-sm shrink-0">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                                <span className="text-sm font-black block truncate whitespace-nowrap">가이드북 사용후기글</span>
                                <span className="text-[10px] font-bold opacity-60 truncate whitespace-nowrap tracking-tight">총 2건의 후기 작성이 필요합니다</span>
                            </div>
                        </div>
                        <span className="font-black text-xl ml-4 shrink-0 whitespace-nowrap">0 / 2개</span>
                    </div>
                )}
                <p className="text-[10px] text-slate-400 font-medium text-center pt-2 tracking-tight whitespace-nowrap">
                    * 활동 현황은 매일 오전 6시에 최종 업데이트됩니다.
                </p>
            </CardContent>
        </Card>
    );
}

// Unused components (ActivityStepper, SubmissionDialog) have been removed for a cleaner dashboard layout.

function UnifiedMissionCalendar({ schedules }: { schedules: any[] }) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: number, events: any[], stamps: any[] } | null>(null);
    const [stamps, setStamps] = useState<any[]>([]);

    useEffect(() => {
        getCalendarStamps().then(res => setStamps(res.data || []));
    }, []);

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

    const getStampsForDay = (day: number) => {
        return stamps.filter(s => {
            const date = new Date(s.date);
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
                        <div className="w-5 h-5 rounded-full border border-[#E63946] flex items-center justify-center text-[10px] text-[#E63946] font-black mix-blend-multiply opacity-80 rotate-[-15deg]">
                            인
                        </div>
                        <span className="text-xs text-slate-400 font-bold">도장 스탬프</span>
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
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
                        <div key={day} className={cn(
                            "text-center text-[10px] font-black py-2 tracking-widest",
                            idx === 0 ? "text-red-500" : "text-slate-300"
                        )}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {blanks.map(i => <div key={`blank-${i}`} className="h-24" />)}
                    {days.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const dayStamps = getStampsForDay(day);
                        const essentialStamp = dayStamps.find(s => s.type === 'essential');
                        const optionalStamps = dayStamps.filter(s => s.type === 'optional');

                        const dayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getDay();
                        const isSunday = dayOfWeek === 0;

                        const isToday = today.getDate() === day &&
                            today.getMonth() === viewDate.getMonth() &&
                            today.getFullYear() === viewDate.getFullYear();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "h-24 border border-slate-100 rounded-2xl p-2 transition-all cursor-pointer group hover:bg-slate-50 hover:shadow-inner relative overflow-hidden",
                                    isToday && "bg-[#F0F5FF]/50 border-[#D6E4FF]",
                                    isSunday && !isToday && "bg-red-50/20"
                                )}
                                onClick={() => {
                                    if (dayEvents.length > 0 || dayStamps.length > 0) {
                                        setSelectedDayInfo({ day, events: dayEvents, stamps: dayStamps });
                                    }
                                }}
                            >
                                <span className={cn(
                                    "text-xs font-black block mb-1 relative z-10",
                                    isToday ? "text-[#0052CC]" : isSunday ? "text-red-500" : "text-slate-500"
                                )}>{day}</span>
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-2 pt-6">
                                    {dayEvents.map(event => {
                                        const timeStr = event.scheduled_at 
                                            ? new Date(event.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
                                            : '';
                                        return (
                                            <div
                                                key={event.id}
                                                className="text-center flex flex-col items-center justify-center space-y-0.5"
                                            >
                                                <div className={cn(
                                                    "font-black tracking-tighter leading-[1.1] break-keep",
                                                    event.is_essential 
                                                        ? "text-[#E63946]/40" 
                                                        : "text-[#0052CC]/40"
                                                )} style={{ fontSize: '13px' }}>
                                                    {event.title}
                                                </div>
                                                <div className={cn(
                                                    "text-[10px] font-bold tracking-tight opacity-40",
                                                    event.is_essential ? "text-[#E63946]" : "text-[#0052CC]"
                                                )}>
                                                    {timeStr}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {essentialStamp && (
                                    <div className={cn(
                                        "absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-multiply transition-all duration-300 transform group-hover:scale-105 z-20",
                                        essentialStamp.status === 'PENDING_APPROVAL' ? "rotate-[-5deg] opacity-60" : "rotate-[-10deg] opacity-90"
                                    )}>
                                        <div className={cn(
                                            "w-[85px] h-[85px] rounded-full border-[2.5px] flex flex-col items-center justify-center font-black text-center leading-[1.2] tracking-tighter relative bg-transparent",
                                            essentialStamp.status === 'PENDING_APPROVAL' ? "border-[#FF8A00] text-[#FF8A00] blur-[0.4px]" : "border-[#e02a3a] text-[#e02a3a]"
                                        )}>
                                            {/* Inner border to simulate double border from image */}
                                            <div className="absolute inset-1 rounded-full border-[1.2px] border-current opacity-80" />
                                            
                                            {/* Top Stars */}
                                            <div className="flex gap-0.5 mb-1 scale-75 opacity-90">
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                <Star className="w-2.5 h-2.5 fill-current -translate-y-1" />
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                            </div>
                                            
                                            <div className="font-black text-[11px] leading-tight transform scale-x-110">
                                                필수활동<br/>완료
                                            </div>

                                            {/* Bottom Stars */}
                                            <div className="flex gap-0.5 mt-1 scale-75 opacity-90">
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                <Star className="w-2.5 h-2.5 fill-current translate-y-1" />
                                                <Star className="w-2.5 h-2.5 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {optionalStamps.length > 0 && (
                                    <div className="absolute bottom-1 right-1 flex -space-x-1.5 z-40 opacity-90 transition-all transform group-hover:-translate-y-1 scale-110 origin-bottom-right">
                                        {optionalStamps.slice(0, 3).map((s, idx) => (
                                            <div key={s.id} className={cn(
                                                "w-7 h-7 rounded-full border-[2px] shadow-sm flex items-center justify-center text-[12px] rotate-[-8deg] bg-white",
                                                s.status === 'APPROVED' ? "border-green-500 text-green-600" : "border-indigo-400 text-indigo-500 blur-[0.2px]"
                                            )} style={{ zIndex: 10 - idx }}>
                                                {s.icon}
                                            </div>
                                        ))}
                                        {optionalStamps.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-[8px] font-black text-slate-500 z-0">
                                                +{optionalStamps.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {selectedDayInfo && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-[24px] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 shadow-inner">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
                            <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-sm">🗓️</span>
                                {viewDate.getFullYear()}.{String(viewDate.getMonth() + 1).padStart(2, '0')}.{String(selectedDayInfo.day).padStart(2, '0')} 기록
                            </h4>
                            <button
                                onClick={() => setSelectedDayInfo(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold bg-white p-2 rounded-full shadow-sm"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(selectedDayInfo.stamps.length > 0) && (
                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Trophy className="w-3 h-3" /> My Achieved Stamps</h5>
                                    <div className="space-y-2">
                                        {selectedDayInfo.stamps.map(st => (
                                            <div key={st.id} className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                                    {st.type === 'essential' ? (
                                                        <span className="text-sm font-black text-indigo-500">🚩</span>
                                                    ) : (
                                                        <span className="text-sm">{st.icon}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-sm text-slate-800">{st.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{st.status === 'completed' || st.status === 'APPROVED' ? 'Verified ✅' : 'Pending ⏳'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(selectedDayInfo.events.length > 0) && (
                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> Scheduled Events</h5>
                                    <div className="space-y-2">
                                        {selectedDayInfo.events.map(event => (
                                            <div key={event.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 border-l-4 shadow-sm" style={{borderLeftColor: event.is_essential ? '#FFD6E0' : '#D6E4FF'}}>
                                                <p className="font-extrabold text-sm text-slate-800 tracking-tight">{event.title}</p>
                                                <p className="text-[11px] font-medium text-slate-500 mt-1 leading-snug">{event.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickLinks() {
    const links = [
        { title: "활동 가이드", desc: "미션 가이드라인", icon: FileText, href: "/dashboard/guide" },
        { title: "자주 묻는 질문", desc: "FAQ 보러가기", icon: HelpCircle, href: "/dashboard/faq" },
        { title: "공식 커뮤니티", desc: "지식카페 바로가기", icon: Users, href: "https://cafe.naver.com/jisiktravel", external: true }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {links.map(link => (
                <Link
                    href={link.href}
                    key={link.title}
                    className="group"
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                >
                    <Card className="hover:shadow-md transition-all duration-300 border border-slate-100 rounded-2xl bg-white p-1 h-full overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                <link.icon className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-extrabold text-slate-800 text-sm whitespace-nowrap truncate tracking-tight">
                                    {link.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-bold whitespace-nowrap truncate tracking-tight">
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
                <Button 
                    onClick={async () => {
                        await signOut();
                        window.location.href = '/login';
                    }}
                    className="mt-10 h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all hover:scale-105"
                >
                    다시 로그인하기
                </Button>
            </div>
        );
    }

    const teamName = data.team === 'naver_cafe' ? "네이버 지식카페 활동" : "네이버 블로그 활동";

    return (
        <div className="max-w-[1400px] mx-auto px-10 py-16">
            <DashboardHeader nickname={data.nickname} role={data.role} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-12">
                    <MonthlyMissionCard currentMission={data.currentMission} />
                </div>
                <div className="lg:col-span-8 space-y-8">
                    <QuickLinks />
                    <UnifiedMissionCalendar schedules={data.schedules} />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#F9F8F3] selection:bg-[#FF5C00] selection:text-white">
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
