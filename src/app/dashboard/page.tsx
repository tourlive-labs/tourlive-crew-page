"use client";

import { useEffect, useState } from "react";
import { MissionStatus, StampStatus } from "@/types/mission";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    CheckCircle2,
    FileText,
    Users,
    ExternalLink,
    Coffee,
    BookOpen,
    HelpCircle,
    ShieldCheck,
    Trophy,
    Award,
    Sparkles,
    ArrowRight,
    AlertCircle,
    Check,
    Paintbrush2,
    Flame,
    Clock
} from "lucide-react";
import { Suspense } from "react";
import { getDashboardData, getStampStatus } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";

// ── Mandatory Task List ─────────────────────────────────────────────────────

/** Blog checklist: 5 items a poster must satisfy per post */
const BLOG_CHECKLIST = [
    "투어라이브 앱 캡처 사진 5장 이상",
    "직접 찍은 사진 5장 이상",
    "UTM 링크 네이버 ID가 포함된 상품 링크 삽입",
    "투어라이브 크루 공식 배너 이미지",
    "활동비 기재 등 필수 하단 멘트 포함",
];

function EssentialTaskList({ team }: { team: string }) {
    const isCafe = team === 'naver_cafe';
    const month  = new Date().getMonth() + 1;
    const [showChecklist, setShowChecklist] = useState(false);

    const cafeTasks = [
        { num: "01", title: "여행 정보 게시글 5건 등록",    sub: "유럽/일본 여행에 관련된 유익한 정보를 자유롭게 공유해주세요." },
        { num: "02", title: "지식여행 카페 댓글 30건 작성", sub: "본인 게시글 댓글 제외" },
        { num: "03", title: "가이드북 사용후기 1건 작성",   sub: "이미지 5장 이상 포함 필수" },
    ];

    return (
        <div className="rounded-brand bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

            {/* ── Header ───────────────────────────────────────────── */}
            <div className={cn(
                "px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-50",
            )}>
                <div className="flex items-center gap-2.5">
                    {/* Icon differs by team */}
                    <div className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center shrink-0",
                        isCafe ? "bg-indigo-900" : "bg-slate-900"
                    )}>
                        {isCafe
                            ? <Coffee  className="w-3.5 h-3.5 text-white" />
                            : <BookOpen className="w-3.5 h-3.5 text-white" />
                        }
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em] leading-none">
                            {month}월 필수 활동 &middot; {isCafe ? "카페" : "블로그"}
                        </p>
                        <p className="text-base font-black text-slate-900 leading-tight mt-0.5">
                            이번 달 완료해야 할 미션
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/mission"
                    className="flex items-center gap-1 text-[10px] font-black text-brand-primary hover:underline uppercase tracking-widest shrink-0"
                >
                    제출 →
                </Link>
            </div>

            {isCafe ? (
                /* ── Cafe: 3 numbered rows ─────────────────────────── */
                <div className="px-6 py-4 divide-y divide-slate-50">
                    {cafeTasks.map((t, i) => (
                        <div key={i} className="flex items-start gap-4 py-3.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-black text-indigo-500 leading-none">{t.num}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 leading-tight">{t.title}</p>
                                <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-snug">{t.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ── Blog: single task + 5-item checklist ──────────── */
                <div className="px-6 py-5 space-y-4">
                    {/* Primary task */}
                    <div className="flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-black text-brand-primary leading-none">01</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-800 leading-tight">
                                가이드북 사용후기 포스팅 <span className="text-brand-primary">2건</span>
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                                오디오가이드 / 가이드북 후기 · 포스팅 2건 모두 제출
                            </p>
                        </div>
                    </div>

                    {/* 5-checklist section */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 overflow-hidden">
                        {/* Checklist header / toggle */}
                        <button
                            onClick={() => setShowChecklist(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100/60 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-brand-primary flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </span>
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                                    5가지 체크리스트 필수
                                </span>
                            </span>
                            <span className={cn(
                                "text-[10px] font-black text-slate-400 transition-transform duration-200",
                                showChecklist ? "rotate-180" : ""
                            )}>▾</span>
                        </button>

                        {/* Checklist items */}
                        {showChecklist && (
                            <div className="px-4 pb-3 space-y-2 border-t border-slate-100 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                {BLOG_CHECKLIST.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <div className="w-4 h-4 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[8px] font-black text-slate-300">{i + 1}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-600 leading-snug">{item}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Footer ───────────────────────────────────────────── */}
            <div className="px-6 pb-5">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Sparkles className="w-3 h-3 text-brand-primary shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 leading-snug">
                        미션 완료 후 &lsquo;활동 제출&rsquo; 탭에서 인증 및 제출해주세요.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Mission Stamp Board ─────────────────────────────────────────────────────

interface StampSlotProps {
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    state: StampStatus;
    href: string;
    accentColor: string;   // tailwind bg class for lit state
    ringColor: string;     // tailwind ring/border class
    stampLabel: string;    // text shown inside stamp when lit
}

function StampSlot({ label, sublabel, icon, state, href, accentColor, ringColor, stampLabel }: StampSlotProps) {
    const isLit  = state !== StampStatus.NONE;
    const isDone = state === StampStatus.APPROVED;
    const isPend = state === StampStatus.PENDING;

    return (
        <Link href={href} className="flex flex-col items-center gap-2.5 group flex-1 min-w-0 active:scale-95 transition-transform">
            {/* Stamp circle — status-check size */}
            <div className={cn(
                "relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-[2.5px] transition-all duration-500 flex items-center justify-center",
                isLit
                    ? cn(ringColor, "shadow-md bg-white")
                    : "border-slate-200 bg-slate-50/80"
            )} style={isLit ? undefined : undefined}>
                {/* Inner ring */}
                {isLit && (
                    <div className={cn(
                        "absolute inset-[4px] rounded-full border border-current opacity-20",
                        ringColor
                    )} />
                )}

                {/* State icon */}
                <div className={cn(
                    "relative z-10 transition-all duration-300",
                    isLit ? "scale-100" : "scale-90 opacity-25 group-hover:opacity-40"
                )}>
                    {isDone ? (
                        <CheckCircle2 className="w-7 h-7" style={{ color: accentColor }} />
                    ) : isPend ? (
                        <Clock className="w-6 h-6" style={{ color: accentColor }} />
                    ) : (
                        <div className="text-slate-300">{icon}</div>
                    )}
                </div>

                {/* Arc label */}
                {isLit && (
                    <div className="absolute inset-0 rounded-full flex items-end justify-center pb-1.5 pointer-events-none">
                        <span
                            className="text-[7px] font-black uppercase tracking-widest"
                            style={{ color: accentColor, opacity: isPend ? 0.7 : 1 }}
                        >
                            {isDone ? 'DONE' : 'IN REVIEW'}
                        </span>
                    </div>
                )}
            </div>

            {/* Label */}
            <div className="text-center">
                <p className={cn(
                    "text-[11px] font-black tracking-tight transition-colors leading-tight",
                    isLit ? "text-slate-800" : "text-slate-400"
                )}>{label}</p>
                <p className="text-[9px] font-bold text-slate-300 mt-0.5">{sublabel}</p>
            </div>
        </Link>
    );
}

function MissionStampBoard() {
    const today    = new Date();
    const month    = today.getMonth();
    const year     = today.getFullYear();
    const lastDay  = new Date(year, month + 1, 0).getDate();
    const deadline = new Date(year, month, lastDay, 23, 59, 0);
    const dDiff    = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const dDay     = Math.max(0, dDiff);
    const progress = Math.round((today.getDate() / lastDay) * 100);

    const [stamps, setStamps] = useState<{ essential: StampStatus; blog: StampStatus; cafe: StampStatus }>({
        essential: StampStatus.NONE, blog: StampStatus.NONE, cafe: StampStatus.NONE
    });

    useEffect(() => {
        getStampStatus().then(res => setStamps(res as any));
    }, []);

    const litCount = [stamps.essential, stamps.blog, stamps.cafe].filter(s => s !== StampStatus.NONE).length;

    return (
        <div className="rounded-brand bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

            {/* Header row */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-brand-primary/5 flex items-center justify-center">
                        <Trophy className="w-3.5 h-3.5 text-brand-primary" />
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em]">
                        {today.getMonth() + 1}월 미션 스탬프
                    </p>
                </div>
                {/* D-Day badge */}
                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black",
                    dDay <= 5
                        ? "bg-rose-50 text-rose-500 border border-rose-100"
                        : dDay <= 10
                        ? "bg-amber-50 text-amber-500 border border-amber-100"
                        : "bg-slate-50 text-slate-500 border border-slate-100"
                )}>
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    D-{dDay}
                </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-3 pb-1">
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-brand-primary to-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-[9px] font-bold text-slate-300 mt-1.5">{today.getMonth() + 1}월 {lastDay}일 마감 · {progress}% 경과</p>
            </div>

            {/* Three Stamp Slots */}
            <div className="px-6 py-5">
                <div className="flex items-start justify-around gap-2">
                    <StampSlot
                        label="필수 활동"
                        sublabel="달성 시 제출"
                        icon={<Award className="w-7 h-7" />}
                        state={stamps.essential}
                        href="/dashboard/mission"
                        accentColor="rgb(255, 92, 0)"
                        ringColor="border-brand-primary"
                        stampLabel="필수완료"
                    />
                    <StampSlot
                        label="블로그 챌린지"
                        sublabel="파리 미술관"
                        icon={<Paintbrush2 className="w-7 h-7" />}
                        state={stamps.blog}
                        href="/dashboard/challenge"
                        accentColor="#D97706"
                        ringColor="border-amber-500"
                        stampLabel="블로그"
                    />
                    <StampSlot
                        label="카페 챌린지"
                        sublabel="연속 출석 도전 !"
                        icon={<Flame className="w-7 h-7" />}
                        state={stamps.cafe}
                        href="/dashboard/challenge"
                        accentColor="#4F46E5"
                        ringColor="border-indigo-500"
                        stampLabel="카페"
                    />
                </div>

                {/* Status line */}
                <div className="mt-4 text-center">
                    {litCount === 0 ? (
                        <p className="text-[10px] font-bold text-slate-300">
                            미션을 완료하면 스탬프가 채워집니다
                        </p>
                    ) : litCount < 3 ? (
                        <p className="text-[10px] font-bold text-slate-400">
                            <span className="text-brand-primary font-black">{litCount}개</span> 제출됨 &middot; {3 - litCount}개 더 남았습니다
                        </p>
                    ) : (
                        <p className="text-[10px] font-black text-emerald-500">
                            🎉 모든 미션 제출 완료!
                        </p>
                    )}
                </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-5">
                <Button
                    asChild
                    className="w-full h-11 min-h-[44px] rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-black text-sm shadow-lg shadow-orange-100/50 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Link href="/dashboard/mission" className="flex items-center justify-center gap-2">
                        필수 활동 제출하기
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

// ── Slim Quick Links ────────────────────────────────────────────────────────────────

function QuickLinks() {
    const links = [
        { title: "활동 가이드", desc: "미션 가이드라인", icon: FileText, href: "/dashboard/guide" },
        { title: "자주 묻는 질문", desc: "FAQ 보러가기", icon: HelpCircle, href: "/dashboard/faq" },
        { title: "공식 커뮤니티", desc: "네이버 지식여행 카페 바로가기", icon: Users, href: "https://cafe.naver.com/jisiktravel", external: true },
    ];

    return (
        <div className="rounded-brand bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-slate-50">
            {links.map((link, i) => (
                <Link
                    key={link.title}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3.5 px-4 py-3 group hover:bg-slate-50 transition-colors"
                >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                        <link.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate leading-tight">{link.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
            ))}
        </div>
    );
}

// ── TourLive Banner ────────────────────────────────────────────────────────────────

function TourliveMiniBanner() {
    return (
        <a
            href="https://www.tourlive.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
        >
            <div className="relative overflow-hidden rounded-brand bg-slate-900 hover:bg-black transition-colors duration-300 shadow-lg shadow-slate-900/10">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                        <ExternalLink className="w-4.5 h-4.5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em] leading-none">Official Website</p>
                        <img
                            src="/logo_black.png"
                            alt="Tourlive"
                            className="h-5 object-contain invert opacity-80 group-hover:opacity-100 transition-opacity mt-1.5"
                        />
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">바로가기</span>
                        <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </a>
    );
}

function DashboardContent() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const res = await getDashboardData();
            if ('error' in res) {
                console.error('[Dashboard] loadData error:', res.error);
                setError(res.error ?? "알 수 없는 오류가 발생했습니다.");
            } else {
                setData(res);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-32 bg-white/50 rounded-brand-xl border border-slate-100 shadow-inner mx-6 lg:mx-10 my-10">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-orange-100 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-white border-t-brand-primary animate-spin" />
                    </div>
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Initializing Dashboard</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-32 mx-6 lg:mx-10 my-10">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-base font-black text-slate-800 mb-2">데이터를 불러오지 못했습니다</p>
                <p className="text-sm text-slate-400 font-medium mb-6 text-center max-w-xs">{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); getDashboardData().then(res => { if ('error' in res) { setError(res.error ?? "알 수 없는 오류가 발생했습니다."); } else { setData(res); } setLoading(false); }); }}
                    className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-black hover:bg-brand-primary-hover transition-colors"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-12 animate-in fade-in duration-700">
            {/* Minimal Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <Badge className="bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/5 border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest">CREW OVERVIEW</Badge>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        <span className="text-brand-primary">{data.nickname}</span>의 크루 활동 대시보드
                    </h1>
                </div>
                {data.role === 'admin' && (
                    <Button 
                        variant="ghost" 
                        asChild
                        className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black group transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href="/admin/missions" className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-orange-400" />
                            관리자 페이지 이동
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                )}
            </div>
            
            {/* Rejection Notification Banner */}
            {data.currentMission?.status === MissionStatus.REJECTED && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link href="/dashboard/mission">
                        <div className="bg-amber-50 border border-amber-200 rounded-brand p-6 flex flex-col md:flex-row items-center justify-between gap-4 group cursor-pointer hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Mission Needs Revision</h4>
                                    <p className="text-sm font-bold text-amber-700 leading-tight">이번 달 필수 미션이 반려되었습니다. 반려 사유를 확인하고 수정해 주세요.</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="bg-white/50 text-amber-700 font-black rounded-xl gap-2 group-hover:bg-amber-100 transition-colors">
                                수정하러 가기
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left — Mission Stamp Board + quick nav */}
                <div className="space-y-4">
                    <MissionStampBoard />
                    <QuickLinks />
                </div>
                {/* Right — Essential tasks + TourLive */}
                <div className="space-y-4">
                    <EssentialTaskList team={data.team || 'naver_blog'} />
                    <TourliveMiniBanner />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
            <DashboardContent />
        </Suspense>
    );
}
