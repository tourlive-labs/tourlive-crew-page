"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitChallenge, type MuseumType } from "@/app/actions/challenge";
import {
    Trophy, Flame, Copy, Check, ChevronDown, ExternalLink,
    Paintbrush2, X, Sparkles, ArrowRight, CheckCircle2,
    AlertCircle, Info
} from "lucide-react";
import { toast } from "sonner";

// ── Data ────────────────────────────────────────────────────────────────────

const MUSEUMS = [
    {
        id: "louvre" as MuseumType,
        emoji: "🏛️",
        name: "루브르 박물관",
        color: "from-amber-50 to-orange-50",
        accent: "#F59E0B",
        accentBg: "bg-amber-50",
        accentText: "text-amber-700",
        accentBorder: "border-amber-200",
        keywords: [
            "루브르 박물관 투어", "루브르 박물관 입장권", "루브르 박물관 예약",
            "루브르 박물관 관람 팁", "루브르 박물관 필수 관람 코스", "루브르 박물관 지도",
            "루브르 박물관 모나리자", "루브르 박물관 밀로의 비너스",
            "루브르 박물관 사모트라케의 니케", "루브르 박물관 관람 시간",
            "루브르 박물관 야간 개장", "루브르 박물관 오디오 가이드",
            "루브르 박물관 입장 대기 줄", "루브르 박물관 추천 동선", "루브르 박물관 사진 촬영",
            "파리 박물관 투어", "파리 미술관 투어", "파리 워킹 투어", "파리 가이드 추천",
            "파리 여행 일정", "파리 당일 코스", "파리 추천 명소",
            "파리 소규모 투어", "파리 가족 여행 코스", "파리 가이드북",
        ],
    },
    {
        id: "orsay" as MuseumType,
        emoji: "🌻",
        name: "오르세 미술관",
        color: "from-rose-50 to-pink-50",
        accent: "#E11D48",
        accentBg: "bg-rose-50",
        accentText: "text-rose-700",
        accentBorder: "border-rose-200",
        keywords: [
            "오르세 미술관 투어", "오르세 미술관 입장권", "오르세 미술관 예약",
            "오르세 미술관 관람 팁", "오르세 미술관 필수 관람 코스", "오르세 미술관 지도",
            "오르세 미술관 인상파", "오르세 미술관 고흐", "오르세 미술관 모네",
            "오르세 미술관 르누아르", "오르세 미술관 야경", "오르세 미술관 관람 시간",
            "오르세 미술관 오디오 가이드", "오르세 미술관 입장 대기 줄",
            "오르세 미술관 추천 동선", "오르세 미술관 사진 촬영",
            "파리 박물관 투어", "파리 미술관 투어", "파리 워킹 투어", "파리 가이드 추천",
            "파리 여행 일정", "파리 당일 코스", "파리 추천 명소",
            "파리 소규모 투어", "파리 가족 여행 코스", "파리 가이드북",
        ],
    },
    {
        id: "orangerie" as MuseumType,
        emoji: "🪷",
        name: "오랑주리 미술관",
        color: "from-emerald-50 to-teal-50",
        accent: "#059669",
        accentBg: "bg-emerald-50",
        accentText: "text-emerald-700",
        accentBorder: "border-emerald-200",
        keywords: [
            "오랑주리 미술관 투어", "오랑주리 미술관 입장권", "오랑주리 미술관 예약",
            "오랑주리 미술관 관람 팁", "오랑주리 미술관 필수 관람 코스", "오랑주리 미술관 지도",
            "오랑주리 미술관 모네 수련", "오랑주리 미술관 인상파",
            "오랑주리 미술관 관람 시간", "오랑주리 미술관 오디오 가이드",
            "오랑주리 미술관 입장 대기 줄", "오랑주리 미술관 추천 동선",
            "오랑주리 미술관 사진 촬영",
            "파리 박물관 투어", "파리 미술관 투어", "파리 워킹 투어", "파리 가이드 추천",
            "파리 여행 일정", "파리 당일 코스", "파리 추천 명소",
            "파리 소규모 투어", "파리 가족 여행 코스", "파리 가이드북",
        ],
    },
] as const;

const CAFE_STEPS = [
    { step: "01", title: "카페 방문", desc: "지식여행 카페에 접속하세요", icon: "🏠" },
    { step: "02", title: "게시글 작성", desc: "여행 정보 1개 (3줄↑ + 사진 3장↑)", icon: "✍️" },
    { step: "03", title: "댓글 소통", desc: "타인 게시글에 댓글 5개 (소통 목적)", icon: "💬" },
    { step: "04", title: "매일 반복", desc: "30일 연속 달성 시 5만P!", icon: "🔥" },
];

const CAFE_TIERS = [
    { days: 10, reward: "1만원권",  color: "from-slate-50 to-slate-100",   pointColor: "text-slate-600",   barColor: "bg-slate-300",   width: "33%" },
    { days: 20, reward: "3만원권",  color: "from-amber-50 to-yellow-100",  pointColor: "text-amber-600",   barColor: "bg-amber-400",   width: "66%" },
    { days: 30, reward: "5만원권",  color: "from-emerald-50 to-green-100", pointColor: "text-emerald-600", barColor: "bg-emerald-500", width: "100%", highlight: true },
];


// ── Sub-Components ───────────────────────────────────────────────────────────

/** Animated success overlay shown after submission */
function SuccessOverlay({ onClose }: { onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3200);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[40px] bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-700">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">제출 완료!</p>
                    <p className="text-sm font-bold text-slate-400">관리자 검토 후 포인트가 지급됩니다</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Keyword pill with copy-one capability */
function KeywordPill({ word, accent }: { word: string; accent: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(word).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
        });
    };
    return (
        <button
            onClick={copy}
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-[11px] font-bold border transition-all duration-200 group/pill",
                "bg-white/70 border-slate-200 text-slate-600 hover:border-current hover:bg-white hover:shadow-sm active:scale-95"
            )}
            style={{ color: copied ? accent : undefined, borderColor: copied ? accent : undefined }}
        >
            {copied ? <Check className="w-2.5 h-2.5 shrink-0" /> : null}
            {word}
        </button>
    );
}

/** Inline submission form (slide-up panel inside card) */
function SubmitPanel({
    challengeType,
    museum,
    rewardType,
    onClose,
}: {
    challengeType: "blog_paris" | "cafe_streak";
    museum?: MuseumType;
    rewardType?: "points" | "naver_pay";
    onClose: () => void;
}) {
    const [url, setUrl] = useState("");
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 200);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) { toast.error("URL을 입력해 주세요."); return; }

        startTransition(async () => {
            const result = await submitChallenge({ challengeType, postUrl: url, museum, rewardType });
            if ("error" in result && result.error) {
                toast.error(result.error);
            } else {
                setSuccess(true);
            }
        });
    };

    const placeholder = challengeType === "blog_paris"
        ? "https://blog.naver.com/..."
        : "https://cafe.naver.com/...";

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-400 border-t border-slate-100 pt-6 mt-6 pb-safe">
            {success ? (
                <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in duration-500">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p className="text-sm font-black text-slate-800">제출이 완료되었습니다 ✓</p>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 text-xs font-bold">
                        닫기
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            포스팅 URL 제출
                        </label>
                        <div className="relative">
                            <Input
                                ref={inputRef}
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder={placeholder}
                                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 text-sm font-bold pr-12 focus:bg-white focus:ring-2 focus:ring-[#FF5C00]/20 focus:border-[#FF5C00] transition-all"
                            />
                            {url && (
                                <button
                                    type="button"
                                    onClick={() => setUrl("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-300 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold ml-1">
                            {challengeType === "blog_paris"
                                ? "네이버 블로그 포스팅 링크를 붙여넣으세요"
                                : "대표 게시글 또는 활동 캡처 링크를 붙여넣으세요"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="flex-1 h-12 min-h-[44px] rounded-2xl text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !url.trim()}
                            className="flex-[2] h-12 min-h-[44px] rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black text-sm shadow-lg shadow-orange-100/60 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    제출 중...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                                    챌린지 제출
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ── Blog Challenge Card ──────────────────────────────────────────────────────

function BlogChallengeCard() {
    const [activeMuseum, setActiveMuseum] = useState<number | null>(null);
    const [rewardType, setRewardType] = useState<"points" | "naver_pay" | null>(null);
    const [showKeywords, setShowKeywords] = useState<number | null>(null);
    const [showSubmit, setShowSubmit] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const copyAll = (idx: number) => {
        const museum = MUSEUMS[idx];
        navigator.clipboard.writeText(museum.keywords.join(" / ")).then(() => {
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1800);
            toast.success(`${museum.name} 키워드 ${museum.keywords.length}개 복사 완료!`);
        });
    };

    return (
        <div className="relative rounded-[32px] sm:rounded-[40px] bg-white border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">

            {/* Glassmorphism gradient orb */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-orange-100/40 blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-50/60 blur-[60px] pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col flex-1 gap-6 sm:gap-8">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge className="bg-[#FFF5F1] text-[#FF5C00] hover:bg-[#FFF5F1] border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                            이번 달 한정
                        </Badge>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Blog Challenge</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Paintbrush2 className="w-6 h-6 text-[#FF5C00]" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                파리 미술관 여행<br />포스팅 챌린지
                            </h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">4월 미션 콘텐츠에 파리 3대 미술관 중 1개 포스팅</p>
                        </div>
                    </div>
                </div>

                {/* Reward Selector — choose exactly one */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">리워드 선택 (1개)</p>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Option A — 5,000P */}
                        <button
                            onClick={() => { setRewardType(rewardType === "points" ? null : "points"); setShowSubmit(false); }}
                            className={cn(
                                "relative flex flex-col gap-2 p-4 sm:p-5 rounded-3xl border-2 text-left transition-all duration-300 min-h-[88px] sm:min-h-0",
                                rewardType === "points"
                                    ? "border-[#FF5C00] bg-gradient-to-br from-[#FFF5F1] to-orange-50 shadow-lg shadow-orange-100/50 scale-[1.02]"
                                    : "border-slate-100 bg-slate-50/50 hover:border-orange-200 hover:bg-orange-50/30"
                            )}
                        >
                            {rewardType === "points" && (
                                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#FF5C00] flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                </div>
                            )}
                            <p className={cn("text-[9px] font-black uppercase tracking-widest", rewardType === "points" ? "text-orange-400" : "text-slate-400")}>
                                확정 리워드
                            </p>
                            <p className={cn("text-3xl font-black tracking-tight leading-none", rewardType === "points" ? "text-[#FF5C00]" : "text-slate-500")}>
                                5,000P
                            </p>
                            <p className={cn("text-[10px] font-bold", rewardType === "points" ? "text-orange-300" : "text-slate-300")}>
                                챌린지 완료 즉시
                            </p>
                        </button>

                        {/* Option B — 네이버페이 2만원권 */}
                        <button
                            onClick={() => { setRewardType(rewardType === "naver_pay" ? null : "naver_pay"); setShowSubmit(false); }}
                            className={cn(
                                "relative flex flex-col gap-2 p-4 sm:p-5 rounded-3xl border-2 text-left transition-all duration-300 min-h-[88px] sm:min-h-0",
                                rewardType === "naver_pay"
                                    ? "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg shadow-amber-100/50 scale-[1.02]"
                                    : "border-slate-100 bg-slate-50/50 hover:border-amber-200 hover:bg-amber-50/30"
                            )}
                        >
                            {rewardType === "naver_pay" && (
                                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                </div>
                            )}
                            <p className={cn("text-[9px] font-black uppercase tracking-widest", rewardType === "naver_pay" ? "text-amber-500" : "text-slate-400")}>
                                상단 노출 보너스
                            </p>
                            <p className={cn("text-xl font-black leading-tight tracking-tight", rewardType === "naver_pay" ? "text-amber-600" : "text-slate-500")}>
                                네이버페이<br />2만원권
                            </p>
                            <p className={cn("text-[10px] font-bold", rewardType === "naver_pay" ? "text-amber-400" : "text-slate-300")}>
                                검색 5위 내 노출 시
                            </p>
                        </button>
                    </div>

                    {/* Naver Pay disclosure — only shown when selected */}
                    {rewardType === "naver_pay" && (
                        <div className="flex gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                                제출 후 관리자가 검색 결과 5위 내 상위 노출 여부를 직접 확인합니다. 노출이 확인되지 않으면 5,000P 기본 리워드로 대체 지급됩니다.
                            </p>
                        </div>
                    )}
                </div>

                {/* Museum Selector — 3-column equal weight */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">미술관 선택 (1개)</p>
                        <div className="flex-1 h-px bg-slate-100" />
                        <Info className="w-3 h-3 text-slate-300" />
                    </div>

                    {/* Horizontal-scroll tab bar on small screens, grid on larger */}
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 scrollbar-none -mx-1 px-1">
                        {MUSEUMS.map((m, idx) => (
                            <button
                                key={m.id}
                                onClick={() => setActiveMuseum(activeMuseum === idx ? null : idx)}
                                className={cn(
                                    "relative flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 group",
                                    "w-[96px] sm:w-auto min-h-[80px] sm:min-h-0",
                                    activeMuseum === idx
                                        ? "border-current shadow-lg scale-[1.02]"
                                        : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                                )}
                                style={activeMuseum === idx ? { borderColor: m.accent, backgroundColor: m.accent + "0D" } : undefined}
                            >
                                <span className="text-2xl">{m.emoji}</span>
                                <span className={cn(
                                    "text-[10px] font-black text-center leading-tight tracking-tight transition-colors",
                                    activeMuseum === idx ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"
                                )}>
                                    {m.name.replace("박물관", "박물관\n").replace("미술관", "미술관\n")}
                                </span>
                                {activeMuseum === idx && (
                                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: m.accent }}>
                                        <Check className="w-2 h-2 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {activeMuseum === null && (
                        <p className="text-[11px] font-bold text-slate-300 text-center py-1">
                            미술관을 선택하면 키워드 목록이 표시됩니다
                        </p>
                    )}
                </div>

                {/* Keywords Panel (Progressive Disclosure) */}
                {activeMuseum !== null && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-400 space-y-3">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowKeywords(showKeywords === activeMuseum ? null : activeMuseum)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                                style={{ color: MUSEUMS[activeMuseum].accent }}
                            >
                                <ChevronDown className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-300",
                                    showKeywords === activeMuseum ? "rotate-180" : ""
                                )} />
                                {showKeywords === activeMuseum ? "키워드 접기" : `키워드 보기 (${MUSEUMS[activeMuseum].keywords.length}개)`}
                            </button>

                            <button
                                onClick={() => copyAll(activeMuseum)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-[10px] font-black border transition-all duration-200 active:scale-95",
                                    copiedIdx === activeMuseum
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300"
                                )}
                            >
                                {copiedIdx === activeMuseum ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                전체 복사
                            </button>
                        </div>

                        {showKeywords === activeMuseum && (
                            <div className={cn(
                                "p-4 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300",
                                MUSEUMS[activeMuseum].accentBg,
                                MUSEUMS[activeMuseum].accentBorder
                            )}>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest mb-3", MUSEUMS[activeMuseum].accentText)}>
                                    카테고리 당 3개 이상 자연스럽게 포함
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {MUSEUMS[activeMuseum].keywords.map((kw) => (
                                        <KeywordPill key={kw} word={kw} accent={MUSEUMS[activeMuseum].accent} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Requirement Row */}
                <div className="flex gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-700">참여 조건</p>
                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                            4월 미션 콘텐츠 (여행 준비·기대평, 여행지 정보 전달)에 키워드 3개 이상 자연스럽게 포함하여 포스팅 후 제출
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-auto">
                    {!showSubmit ? (
                        <Button
                            onClick={() => setShowSubmit(true)}
                            disabled={activeMuseum === null || rewardType === null}
                            className={cn(
                                "w-full h-14 min-h-[44px] rounded-2xl font-black text-base gap-2 transition-all duration-300",
                                activeMuseum !== null && rewardType !== null
                                    ? "bg-[#FF5C00] hover:bg-[#E63900] text-white shadow-xl shadow-orange-100/60 hover:scale-[1.02] active:scale-95"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            )}
                        >
                            <Sparkles className="w-5 h-5" />
                            {activeMuseum === null
                                ? "미술관을 먼저 선택해 주세요"
                                : rewardType === null
                                    ? "리워드를 선택해 주세요"
                                    : "챌린지 링크 제출하기"}
                        </Button>
                    ) : (
                        <SubmitPanel
                            challengeType="blog_paris"
                            museum={activeMuseum !== null ? MUSEUMS[activeMuseum].id : undefined}
                            rewardType={rewardType ?? undefined}
                            onClose={() => setShowSubmit(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Cafe Challenge Card ──────────────────────────────────────────────────────

function CafeChallengeCard() {
    const [showRules, setShowRules] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);

    return (
        <div className="relative rounded-[32px] sm:rounded-[40px] bg-white border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">

            {/* Glass orbs */}
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-indigo-100/30 blur-[70px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-violet-50/50 blur-[50px] pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col flex-1 gap-6 sm:gap-8">

                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                            30일 스트릭
                        </Badge>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cafe Challenge</span>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Flame className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                네이버 카페<br />챌린지
                            </h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">
                                <span className="text-indigo-500 font-black">4.1 — 4.30</span> · 매일 게시글 1 + 댓글 5
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reward Ladder */}
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">연속 달성 리워드 (네이버페이)</p>
                    {CAFE_TIERS.map((tier) => (
                        <div
                            key={tier.days}
                            className={cn(
                                "relative flex items-center justify-between p-4 rounded-2xl border overflow-hidden transition-all",
                                tier.highlight
                                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-md shadow-emerald-100/50"
                                    : `bg-gradient-to-r ${tier.color} border-slate-100`
                            )}
                        >
                            {/* Progress bar bg */}
                            <div
                                className={cn("absolute left-0 top-0 bottom-0 opacity-10 rounded-2xl transition-all", tier.barColor)}
                                style={{ width: tier.width }}
                            />
                            <div className="relative flex items-center gap-3">
                                <span className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0",
                                    tier.highlight ? "bg-emerald-500 text-white shadow-lg" : "bg-white/70 text-slate-500"
                                )}>
                                    {tier.days}일
                                </span>
                                <span className={cn(
                                    "font-black tracking-tight",
                                    tier.highlight ? "text-emerald-700 text-base" : "text-slate-600 text-sm"
                                )}>
                                    {tier.reward}
                                </span>
                                {tier.highlight && <Trophy className="w-4 h-4 text-emerald-500" />}
                            </div>
                            <span className={cn(
                                "relative text-2xl font-black",
                                tier.pointColor
                            )}>
                                {tier.highlight ? "💸💸💸" : tier.days === 20 ? "💸💸" : "💸"}
                            </span>
                        </div>
                    ))}

                </div>

                {/* Steps */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">참여 방법</p>
                    <div className="grid grid-cols-2 gap-2">
                        {CAFE_STEPS.map((s) => (
                            <div key={s.step} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-slate-300">{s.step}</span>
                                    <span className="text-base">{s.icon}</span>
                                </div>
                                <p className="text-xs font-black text-slate-700 leading-tight">{s.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 leading-snug">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rules Toggle */}
                <div>
                    <button
                        onClick={() => setShowRules(!showRules)}
                        className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest transition-opacity hover:opacity-70"
                    >
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showRules ? "rotate-180" : "")} />
                        {showRules ? "규칙 접기" : "상세 규칙 보기"}
                    </button>

                    {showRules && (
                        <div className="mt-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">게시글 기준 (매일 1개)</p>
                                {[
                                    "유럽/일본 실시간 여행·날씨 정보",
                                    "여행지 정보 (티켓 예약, 국제학생증 할인, 가는 방법, 꿀팁 등)",
                                    "숙소, 맛집, 기념품 추천 등",
                                    "모바일 기준 3줄 이상 + 사진 3장 이상 필수",
                                    "형식적·성의 없는 글 / 본인 블로그 퍼오기 불인정",
                                ].map((r, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] font-bold text-indigo-700">
                                        <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        {r}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-3 border-t border-indigo-100">
                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">댓글 기준 (매일 5개)</p>
                                {[
                                    "단순 채우기 금지 → 진짜 소통 목적",
                                    "본인 게시글의 댓글은 불인정",
                                    "의미 없는 댓글 불인정",
                                ].map((r, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] font-bold text-indigo-700">
                                        <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Info + CTA */}
                <div className="mt-auto space-y-3">
                    <a
                        href="https://cafe.naver.com/jisiktravel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/60 hover:border-indigo-200 transition-all group"
                    >
                        <div className="space-y-0.5">
                            <p className="text-xs font-black text-indigo-700">지식여행 카페 바로가기</p>
                            <p className="text-[10px] font-bold text-indigo-400">닉네임 = 크루 활동명으로 설정</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>

                    {!showSubmit ? (
                        <Button
                            onClick={() => setShowSubmit(true)}
                            className="w-full h-14 min-h-[44px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base gap-2 shadow-xl shadow-indigo-100/60 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Flame className="w-5 h-5" />
                            챌린지 참여 증빙 제출
                        </Button>
                    ) : (
                        <SubmitPanel
                            challengeType="cafe_streak"
                            onClose={() => setShowSubmit(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Quick Info Bar ───────────────────────────────────────────────────────────

function QuickInfoBar() {
    return (
        <div className="rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF5C00] rounded-full blur-[80px] opacity-15 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Info className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white leading-tight">공통 안내</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">챌린지 완료 후 제출 폼 작성 필수</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-black text-slate-300 border border-white/10">
                        카페 닉네임 = 크루 활동명
                    </span>

                </div>
            </div>
        </div>
    );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ChallengePage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:px-10 lg:py-16 space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-32">

            {/* Page Header */}
            <div className="space-y-3">
                <Badge className="bg-[#FFF5F1] text-[#FF5C00] hover:bg-[#FFF5F1] border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                    April 2026
                </Badge>
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm shrink-0">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5C00]" />
                            </div>
                            이달의 챌린지
                        </h1>
                        <p className="text-sm font-bold text-slate-400 ml-[52px] sm:ml-16">
                            파리 미술관 포스팅 챌린지 · 카페 30일 연속 챌린지
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">진행 중</span>
                    </div>
                </div>
            </div>

            {/* Cards — always single column */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
                <BlogChallengeCard />
                <CafeChallengeCard />
            </div>

            {/* Quick Info Bar */}
            <QuickInfoBar />
        </div>
    );
}
