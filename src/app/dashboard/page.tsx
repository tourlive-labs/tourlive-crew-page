"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    Quote
} from "lucide-react";
import { Suspense } from "react";
import { getDashboardData } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function DashboardHeader({ nickname, term, dDay, teamName }: { nickname: string, term: number, dDay: number, teamName: string }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider">
                            {teamName}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold">Official Crew</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
                        반갑습니다, <span className="text-[#FF5C00]">{nickname}</span>님!
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="px-3 py-1 rounded-full bg-[#F0F5FF] text-[#0052CC] text-xs font-bold border border-[#D6E4FF] whitespace-nowrap">
                            {term}기 공식 크루
                        </span>
                        <p className="text-slate-500 text-sm font-medium whitespace-nowrap">
                            활동 <span className="text-slate-800 font-bold">{dDay}</span>일차입니다
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all whitespace-nowrap">
                    <Bell className="w-4 h-4 mr-2" />
                    공지사항
                </Button>
            </div>
        </div>
    );
}

function ActivityStepper({ missions }: { missions: any[] }) {
    // Specific names for March, April, May as requested
    const specificMissionNames = [
        "3월: 가이드북 사용후기글",
        "4월: 오디오가이드 사용후기글",
        "5월: 오디오가이드 사용후기글"
    ];

    return (
        <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white p-2">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight whitespace-nowrap">
                    <Target className="w-6 h-6 mr-3 text-[#FF5C00]" />
                    필수 활동 3가지
                </CardTitle>
                <div className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black border border-slate-100 uppercase tracking-widest whitespace-nowrap">
                    Term Progress
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <div className="relative flex justify-between items-start pt-4 px-4 pb-2">
                    <div className="absolute top-[36px] left-[10%] w-[80%] h-1 bg-slate-50 -z-0 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#FFD6E0] to-[#D6E4FF] transition-all duration-1000"
                            style={{
                                width: `${(missions.filter(m => m.status === 'completed').length / Math.max(missions.length, 1)) * 100}%`
                            }}
                        />
                    </div>
                    {missions.map((mission, idx) => {
                        const statusColor = mission.status === 'completed'
                            ? "bg-[#D6E4FF] text-[#0052CC]"
                            : mission.status === 'ongoing'
                                ? "bg-[#FFD6E0] text-[#E63946]"
                                : "bg-slate-50 text-slate-300";

                        // Use specific names if available, otherwise fallback to mission.title
                        const displayTitle = specificMissionNames[idx] || mission.title;

                        return (
                            <div key={mission.id} className="relative z-10 flex flex-col items-center group max-w-[120px] text-center">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-md transition-all duration-500",
                                    statusColor,
                                    mission.status === 'ongoing' && "scale-110 ring-4 ring-white"
                                )}>
                                    {mission.status === 'completed'
                                        ? <CheckCircle2 className="w-6 h-6" />
                                        : <span className="font-black text-lg">{idx + 1}</span>
                                    }
                                </div>
                                <div className="mt-4 flex flex-col items-center gap-1 overflow-hidden w-full">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-2",
                                        mission.status === 'completed' ? "text-[#0052CC]" : mission.status === 'ongoing' ? "text-[#E63946]" : "text-slate-300"
                                    )}>
                                        {mission.status === 'completed' ? '완료' : mission.status === 'ongoing' ? '진행 중' : '대기'}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-bold leading-tight truncate w-full px-1",
                                        mission.status !== 'pending' ? "text-slate-800" : "text-slate-400"
                                    )} title={displayTitle}>{displayTitle}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function TeamMissionList({ team }: { team: string }) {
    const isCafe = team === 'Naver Cafe';
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

function SubmissionDialog({ mission, idx }: { mission: any, idx: number }) {
    const [open, setOpen] = useState(false);
    const [link, setLink] = useState("");
    const [contentText, setContentText] = useState("");
    const [checks, setChecks] = useState({
        appCaptures: false,
        personalPhotos: false,
        utmLink: false,
        banner: false,
        closingText: false
    });

    // Specific names for March, April, May as requested
    const specificMissionNames = [
        "3월: 가이드북 사용후기글",
        "4월: 오디오가이드 사용후기글",
        "5월: 오디오가이드 사용후기글"
    ];
    const displayTitle = specificMissionNames[idx] || mission.title;

    const isReviewMission = displayTitle.includes("후기") || displayTitle.includes("Review");
    const allChecked = !isReviewMission || Object.values(checks).every(Boolean);
    const isValidUTM = link.includes("utm_campaign=") && link.includes("crewid_"); // Simple mock validation
    const hasClosingText = contentText.includes("이 글은 투어라이브 크루 활동의 일환으로");

    const handleCheck = (key: keyof typeof checks) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = () => {
        if (isReviewMission && !allChecked) {
            toast.error("모든 체크리스트를 확인해 주세요.");
            return;
        }
        if (isReviewMission && !hasClosingText) {
            toast.error("필수 하단 멘트가 포함되지 않았습니다.");
            return;
        }

        toast.success("미션 제출이 완료되었습니다!");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={cn(
                        "w-full h-12 rounded-2xl font-bold shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap",
                        mission.status === 'completed' ? "bg-slate-100 text-slate-400 cursor-default" : "bg-[#FF5C00] hover:bg-[#E63900] text-white"
                    )}
                    disabled={mission.status === 'completed'}
                >
                    {mission.status === 'completed' ? '이미 완료됨' : '미션 제출하기'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 overflow-hidden bg-white">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight truncate px-1">
                        {displayTitle}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium mt-2">
                        활동 가이드라인을 준수하여 미션을 제출해 주세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {isReviewMission && (
                        <div className="space-y-4 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest mb-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                Submission Self-Checklist
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { key: 'appCaptures', label: '투어라이브 앱 캡처 사진 5장 이상 포함' },
                                    { key: 'personalPhotos', label: '직접 찍은 본인 사진 5장 이상 포함' },
                                    { key: 'utmLink', label: '투어/가이드북 UTM 링크 첨부 (ID 포함)' },
                                    { key: 'banner', label: '크루 하단 배너 이미지 삽입' },
                                    { key: 'closingText', label: '필수 하단 멘트 포함' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleCheck(item.key as any)}>
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                            checks[item.key as keyof typeof checks] ? "bg-orange-600 border-orange-600" : "bg-white border-slate-200 group-hover:border-orange-300"
                                        )}>
                                            {checks[item.key as keyof typeof checks] && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className={cn("text-sm font-bold transition-colors whitespace-nowrap", checks[item.key as keyof typeof checks] ? "text-slate-800" : "text-slate-400")}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-black text-sm ml-1 flex items-center">
                                <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
                                게시글 링크 (URL)
                            </Label>
                            <Input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                disabled={isReviewMission && !allChecked}
                                placeholder={isReviewMission && !allChecked ? "체크리스트를 먼저 완료해 주세요" : "https://blog.naver.com/..."}
                                className={cn(
                                    "h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-base shadow-none transition-all",
                                    isReviewMission && !allChecked && "opacity-50 grayscale cursor-not-allowed"
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-black text-sm ml-1 flex items-center">
                                <Quote className="w-4 h-4 mr-2 text-slate-400" />
                                게시글 전문 붙여넣기 (검증용)
                            </Label>
                            <Textarea
                                value={contentText}
                                onChange={(e) => setContentText(e.target.value)}
                                placeholder="게시글 내용을 전체 복사하여 붙여넣어 주세요. 필수 멘트 포함 여부를 자동으로 확인합니다."
                                className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm shadow-none resize-none leading-relaxed p-4"
                            />
                            {contentText && (
                                <div className={cn(
                                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full w-fit mt-1",
                                    hasClosingText ? "bg-[#F0F5FF] text-[#0052CC]" : "bg-[#FFF0F3] text-[#E63946]"
                                )}>
                                    {hasClosingText ? '✓ 필수 하단 멘트 확인됨' : '✗ 하단 멘트가 보이지 않습니다'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)} className="h-14 rounded-2xl border-slate-200 font-bold text-slate-500 whitespace-nowrap">
                        취소
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!link || (isReviewMission && !allChecked)}
                        className="h-14 rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black shadow-lg shadow-orange-100/50 flex-1 px-8 text-lg whitespace-nowrap"
                    >
                        최종 미션 제출하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                                <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        { title: "활동 가이드", desc: "미션 가이드라인", icon: FileText, href: "/dashboard/guide" },
        { title: "공식 커뮤니티", desc: "지식카페 바로가기", icon: Users, href: "https://cafe.naver.com/jisiktravel", external: true },
        { title: "관리자 문의", desc: "이메일 문의하기", icon: ExternalLink, href: "mailto:root@tourlive.co.kr" }
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
                <Button asChild className="mt-10 h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-all hover:scale-105">
                    <Link href="/login">다시 로그인하기</Link>
                </Button>
            </div>
        );
    }

    const teamName = data.team === 'Naver Cafe' ? "네이버 지식카페 활동" : "네이버 블로그 활동";

    return (
        <div className="max-w-[1400px] mx-auto px-10 py-16">
            <DashboardHeader
                nickname={data.nickname}
                term={data.term}
                dDay={data.dDay}
                teamName={teamName}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-12">
                    <ActivityStepper missions={data.essentialMissions} />
                    <TeamMissionList team={data.team} />
                    <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white p-2">
                        <div className="h-2 bg-gradient-to-r from-[#FFD6E0] via-[#F0F5FF] to-[#D6E4FF]" />
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap">미션 제출 데스크</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1 truncate">
                                현재 진행 가능한 미션을 선택해 주세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-4">
                            {data.essentialMissions.map((mission: any, idx: number) => {
                                // Specific names for March, April, May match
                                const specificMissionNames = [
                                    "3월: 가이드북 사용후기글",
                                    "4월: 오디오가이드 사용후기글",
                                    "5월: 오디오가이드 사용후기글"
                                ];
                                const displayTitle = specificMissionNames[idx] || mission.title;

                                return (
                                    <div key={mission.id} className="space-y-4 pt-5 border-t border-slate-50 first:border-0 first:pt-0 group">
                                        <div className="flex items-center justify-between overflow-hidden">
                                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                                <span className="text-slate-800 font-bold text-sm truncate whitespace-nowrap" title={displayTitle}>{displayTitle}</span>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap",
                                                    mission.status === 'completed' ? "text-[#0052CC]" : mission.status === 'ongoing' ? "text-[#FF5C00]" : "text-slate-200"
                                                )}>
                                                    {mission.status === 'completed' ? '완료됨' : mission.status === 'ongoing' ? '지금 제출 가능' : '제출 대기'}
                                                </span>
                                            </div>
                                            {mission.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#0052CC] shrink-0 ml-2" />}
                                        </div>
                                        <SubmissionDialog mission={mission} idx={idx} />
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-8 space-y-8">
                    <QuickLinks />
                    <EventCalendar schedules={data.schedules} />
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
