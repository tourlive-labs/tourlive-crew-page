"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    CheckCircle2,
    FileText,
    Bell,
    Users,
    ExternalLink,
    Coffee,
    BookOpen,
    HelpCircle,
    ShieldCheck,
    Trophy,
    Target,
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
import { submitMission } from "@/app/actions/mission";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

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

// ── Mandatory Task List ─────────────────────────────────────────────────────

function EssentialTaskList({ team }: { team: string }) {
    const isCafe   = team === 'naver_cafe';
    const month    = new Date().getMonth() + 1;

    const blogTasks = [
        { num: "01", title: "가이드북 사용후기 포스팅", sub: "오디오가이드 / 가이드북 후기 미션" },
        { num: "02", title: "UTM 소스 링크 삽입", sub: "포스팅 내 공식 링크 내용 포함" },
        { num: "03", title: "필수 멘트 작성", sub: "지정 멘트 텊플릿 빠짐없이 포함" },
    ];
    const cafeTasks = [
        { num: "01", title: "여행 정보 게시글 5건 등록", sub: "유럽/일본 여행에 관련된 유익한 정보를 자유롭게 공유해주세요." },
        { num: "02", title: "지식여행 카페 댓글 30건 작성", sub: "본인 게시글 댓글 제외" },
        { num: "03", title: "가이드북 사용후기 1건 작성", sub: "이미지 5장 이상 포함 필수" },
    ];
    const tasks = isCafe ? cafeTasks : blogTasks;

    return (
        <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em] leading-none">
                            {month}월 필수 활동
                        </p>
                        <p className="text-base font-black text-slate-900 leading-tight mt-0.5">
                            이번 달 완료해야 할 미션
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/mission"
                    className="flex items-center gap-1 text-[10px] font-black text-[#FF5C00] hover:underline uppercase tracking-widest shrink-0"
                >
                    제출 →
                </Link>
            </div>

            {/* Numbered task rows */}
            <div className="px-6 py-4 space-y-0 divide-y divide-slate-50">
                {tasks.map((t, i) => (
                    <div key={i} className="flex items-start gap-4 py-3.5">
                        {/* Number badge */}
                        <div className="w-7 h-7 rounded-full bg-[#FFF5F1] border border-[#FFD9C6] flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-black text-[#FF5C00] leading-none">{t.num}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 leading-tight">{t.title}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-snug">{t.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Sparkles className="w-3 h-3 text-[#FF5C00] shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 leading-snug">
                        미션 완료 후 '활동 제출' 탭에서 인증 및 제출해주세요.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Mission Stamp Board ─────────────────────────────────────────────────────

type StampState = 'none' | 'pending' | 'approved';

interface StampSlotProps {
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    state: StampState;
    href: string;
    accentColor: string;   // tailwind bg class for lit state
    ringColor: string;     // tailwind ring/border class
    stampLabel: string;    // text shown inside stamp when lit
}

function StampSlot({ label, sublabel, icon, state, href, accentColor, ringColor, stampLabel }: StampSlotProps) {
    const isLit  = state !== 'none';
    const isDone = state === 'approved';
    const isPend = state === 'pending';

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

    const [stamps, setStamps] = useState<{ essential: StampState; blog: StampState; cafe: StampState }>({
        essential: 'none', blog: 'none', cafe: 'none'
    });

    useEffect(() => {
        getStampStatus().then(res => setStamps(res as any));
    }, []);

    const litCount = [stamps.essential, stamps.blog, stamps.cafe].filter(s => s !== 'none').length;

    return (
        <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">

            {/* Header row */}
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#FFF5F1] flex items-center justify-center">
                        <Trophy className="w-3.5 h-3.5 text-[#FF5C00]" />
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
                        className="h-full bg-gradient-to-r from-[#FF5C00] to-amber-400 rounded-full transition-all duration-700"
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
                        accentColor="#FF5C00"
                        ringColor="border-[#FF5C00]"
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
                            <span className="text-[#FF5C00] font-black">{litCount}개</span> 제출됨 &middot; {3 - litCount}개 더 남았습니다
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
                    className="w-full h-11 min-h-[44px] rounded-xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black text-sm shadow-lg shadow-orange-100/50 transition-all hover:scale-[1.02] active:scale-95"
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
        <div className="rounded-[20px] bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-slate-50">
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
            <div className="relative overflow-hidden rounded-[20px] bg-slate-900 hover:bg-black transition-colors duration-300 shadow-lg shadow-slate-900/10">
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-32 bg-white/50 rounded-[40px] border border-slate-100 shadow-inner mx-6 lg:mx-10 my-10">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-orange-100 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-white border-t-[#FF5C00] animate-spin" />
                    </div>
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Initializing Dashboard</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-12 animate-in fade-in duration-700">
            {/* Minimal Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <Badge className="bg-[#FFF5F1] text-[#FF5C00] hover:bg-[#FFF5F1] border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest">CREW OVERVIEW</Badge>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        <span className="text-[#FF5C00]">{data.nickname}</span>의 크루 활동 대시보드
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
            {data.currentMission?.status === 'REJECTED' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link href="/dashboard/mission">
                        <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 group cursor-pointer hover:shadow-md transition-all">
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
        <Suspense fallback={<div className="min-h-screen bg-[#F9F8F3]" />}>
            <DashboardContent />
        </Suspense>
    );
}
