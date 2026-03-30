"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Trophy,
    Target,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Coffee,
    BookOpen,
    MessageSquare,
    RefreshCcw,
    ClipboardList,
    Smartphone,
    Star,
    Lock,
    CheckSquare
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { submitMission, verifyMissionContent, updateCafeCounts, submitSurvey, requestReward } from "@/app/actions/mission";
import { getSideMissions, submitSideMission } from "@/app/actions/side_missions";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function MissionSubmissionCard({ currentMission, goalCount, isCafeTeam, onRefresh }: { currentMission: any, goalCount: number, isCafeTeam: boolean, onRefresh: () => void }) {
    const verifiedLinks = currentMission?.post_url ? currentMission.post_url.split(',').map((u: string) => u.trim()).filter(Boolean) : [];
    
    // We only need the state for the *current* slot being filled
    const [link, setLink] = useState("");
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cafeChecks, setCafeChecks] = useState({
        images: false,
        utm: false,
        mention: false
    });

    const router = useRouter();

    const isRejected = currentMission?.status === 'REJECTED' || currentMission?.status === 'rejected';
    const isPending = currentMission?.status === 'PENDING_APPROVAL' || currentMission?.status === 'completed';
    const isFullySubmitted = (isPending) || (verifiedLinks.length >= goalCount && !isRejected);
    // Current slot index (1-based)
    const currentSlotIndex = verifiedLinks.length + 1;
    
    const statusText = currentMission?.status === 'checking' ? `활동 진행 중 (${verifiedLinks.length}/${goalCount})` : 
                      currentMission?.status === 'PENDING_APPROVAL' ? '심사 대기 중' :
                      currentMission?.status === 'completed' ? '최종 검토 완료' : 
                      isRejected ? '반려됨 (수정 필요)' : '미진행';

    const handleVerify = async () => {
        if (!link) return;
        setIsVerifying(true);
        const res = await verifyMissionContent(link);
        if (res.error) {
            toast.error(res.error);
        } else {
            setVerificationResult(res.data);
            if (!isCafeTeam) {
                if (res.data?.isValid) {
                    toast.success("링크 조건이 모두 충족되었습니다! 제출 버튼을 눌러 확정해 주세요.");
                } else {
                    toast.warning("조건이 충족되지 않았습니다. 링크나 본문을 확인해 주세요.");
                }
            }
        }
        setIsVerifying(false);
    };

    const handleLinkSubmit = async () => {
        if (!link) return;
        setIsSubmitting(true);
        const res = await submitMission(link);
        if (res.error) {
            toast.error(res.error);
        } else {
            if (isCafeTeam) {
                // Simple success for Cafe
                toast.success("미션이 제출되었습니다. 관리자가 확인 후 승인해 드립니다! ✨");
            } else {
                // Detailed AI feedback for Blog
                if (res.verified) {
                    toast.success("AI 검토 결과, 조건이 모두 충족되어 심사 대기로 자동 전환되었습니다!");
                } else if (res.reason) {
                    toast.warning(`미션 기준 미달: ${res.reason}`);
                } else {
                    toast.success(`미션 링크가 제출되었습니다.`);
                }
            }
            setLink("");
            setVerificationResult(null);
            onRefresh();
        }
        setIsSubmitting(false);
    };

    return (
        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white mb-8">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between bg-slate-50/50">
                <div>
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center tracking-tight">
                        <Trophy className="w-6 h-6 mr-3 text-[#FF5C00]" />
                        링크 인증 제출 ({verifiedLinks.length} / {goalCount})
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-1">
                        {isRejected ? "반려된 미션입니다. 아래 사유를 확인하고 링크를 다시 제출해 주세요." : "블로그 또는 카페 활동 중인 링크를 순서대로 제출해 주세요."}
                    </CardDescription>
                </div>
                {currentMission && currentMission.status !== 'none' && (
                    <Badge className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        currentMission.status === 'checking' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                        currentMission.status === 'PENDING_APPROVAL' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                        currentMission.status === 'completed' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        isRejected ? "bg-red-50 text-red-600 border border-red-100" :
                        "bg-slate-50 text-slate-600 border border-slate-100"
                    )}>
                        {statusText}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-8">
                {isRejected && (currentMission?.admin_feedback || currentMission?.rejection_reason) && (
                    <div className="mb-6 p-6 rounded-[24px] bg-red-50 border border-red-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">반려 사유 확인 및 재검토 요청</p>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                                "{currentMission.rejection_reason || currentMission.admin_feedback}"
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-red-400">
                                <RefreshCcw className="w-3 h-3" />
                                링크를 다시 제출하면 자동으로 검토 대기 상태로 전환됩니다.
                            </div>
                        </div>
                    </div>
                )}
                <div className="space-y-6">
                    {/* Render Locked Links */}
                    {verifiedLinks.length > 0 && (
                        <div className="space-y-3">
                            {verifiedLinks.map((url: string, idx: number) => (
                                <div key={idx} className="p-4 rounded-2xl bg-green-50/30 border border-green-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div className="overflow-hidden shadow-sm">
                                            <span className="text-[10px] font-black text-green-600 block uppercase tracking-widest mb-0.5">인증 완료된 링크 {idx + 1}</span>
                                            <span className="text-sm font-bold text-slate-700 truncate block">{url}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="text-green-700 hover:text-green-800 hover:bg-green-100 rounded-xl">
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            확인
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Render Input for NEXT link (if goal not reached) */}
                    {isFullySubmitted ? (
                        <div className="mt-8 p-10 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 mb-1">미션 제출 완료</h3>
                            <p className="text-sm font-medium text-slate-500 max-w-[280px]">
                                {currentMission?.status === 'completed' 
                                    ? "모든 검토가 완료되었습니다. 리워드 지급을 신청해 주세요!" 
                                    : "작성하신 링크가 성공적으로 제출되었습니다. 관리자가 확인 후 최종 승인해 드립니다."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 mt-6">
                            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100/50">
                                <h4 className="text-sm font-black text-orange-800 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    링크 {currentSlotIndex} - 필수 체크리스트
                                </h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "앱 캡처 5장 이상",
                                        "직접 찍은 사진 5장 이상",
                                        "UTM 링크 포함",
                                        "크루 배너 삽입",
                                        "하단 필수 멘트 포함"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-xs font-bold text-orange-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="text-sm font-black text-slate-700 ml-1">제출 링크 {currentSlotIndex}</Label>
                                <Input
                                    value={link}
                                    onChange={(e) => {
                                        setLink(e.target.value);
                                        setVerificationResult(null);
                                    }}
                                    placeholder={isCafeTeam ? "https://cafe.naver.com/jisiktravel/글번호" : "https://blog.naver.com/아이디/글번호"}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-base shadow-none transition-all"
                                />

                                {isCafeTeam && (
                                    <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 mt-1 space-y-3">
                                        <h4 className="text-sm font-black text-orange-800 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> 필수 자가 체크 (체크 후 제출 가능)
                                        </h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={cafeChecks.images}
                                                    onChange={(e) => setCafeChecks(prev => ({ ...prev, images: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700 transition-colors">이미지 10장 이상 포함 완료 (앱 캡쳐 5 + 사진 5)</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={cafeChecks.utm}
                                                    onChange={(e) => setCafeChecks(prev => ({ ...prev, utm: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700 transition-colors">투어라이브 링크(UTM) 삽입 완료</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={cafeChecks.mention}
                                                    onChange={(e) => setCafeChecks(prev => ({ ...prev, mention: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700 transition-colors">하단 필수 고지 문구 삽입 완료</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {verificationResult && (
                                    <div className={cn("p-5 rounded-2xl border mt-1 space-y-3", isCafeTeam ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-200")}>
                                        <h4 className={cn("text-sm font-black flex items-center gap-2", isCafeTeam ? "text-indigo-800" : "text-slate-800")}>
                                            <CheckCircle2 className={cn("w-4 h-4", isCafeTeam ? "text-indigo-600" : "text-green-600")} /> 
                                            {isCafeTeam ? "확인 완료" : "AI 사전 검토 결과"}
                                        </h4>
                                        {isCafeTeam ? (
                                            <p className="text-sm font-medium text-indigo-700/80 leading-relaxed">
                                                작성하신 카페 글의 모든 조건(이미지/링크/멘트)을 확인하셨습니다. 제출하시면 관리자가 확인 후 최종 승인해 드립니다.
                                            </p>
                                        ) : (
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-600">📸 이미지 개수 (10장 이상)</span>
                                                    <span className="font-bold">{verificationResult.imagePass ? "✅" : "❌"}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-600">🔗 투어 UTM 링크 포함</span>
                                                    <span className="font-bold">{verificationResult.utm_tour ? "✅" : "❌"}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-600">🔗 가이드북 UTM 링크 포함</span>
                                                    <span className="font-bold">{verificationResult.utm_guide ? "✅" : "❌"}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-600">💬 필수 멘트 포함</span>
                                                    <span className="font-bold">{verificationResult.mention ? "✅" : "❌"}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!verificationResult?.isValid && !isCafeTeam ? (
                                    <Button 
                                        onClick={() => {
                                            if (link.includes('naver.me')) {
                                                toast.error("단축 주소(naver.me)는 AI가 읽을 수 없습니다. 브라우저 주소창의 전체 주소를 복사해서 다시 제출해 주세요!", {
                                                    style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fee2e2' }
                                                });
                                                return;
                                            }
                                            handleVerify();
                                        }}
                                        disabled={!link || isVerifying || isSubmitting}
                                        className="h-14 w-full rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black shadow-none mt-2"
                                    >
                                        {isVerifying ? (
                                            <><RefreshCcw className="w-5 h-5 animate-spin mr-2" /> AI가 링크 확인 중...</>
                                        ) : (
                                            "사전 링크 확인하기"
                                        )}
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleLinkSubmit}
                                        disabled={!link || isSubmitting || (isCafeTeam && (!cafeChecks.images || !cafeChecks.utm || !cafeChecks.mention))}
                                        className="h-14 w-full rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black shadow-lg shadow-orange-100/50 mt-2 animate-in slide-in-from-bottom-2 fade-in duration-300"
                                    >
                                        {isSubmitting ? (
                                            <><RefreshCcw className="w-5 h-5 animate-spin mr-2" /> {isCafeTeam ? "미션을 제출 중입니다..." : "AI가 미션을 검토 중입니다..."}</>
                                        ) : isCafeTeam ? "확인 완료! 미션 최종 제출하기" : "조건 달성성공! 이 링크 확정하기"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function SurveyView({ 
    onSubmit, 
    onCancel 
}: { 
    onSubmit: (data: any) => Promise<void>, 
    onCancel: () => void 
}) {
    const [tourName, setTourName] = useState("");
    const [rating, setRating] = useState(0);
    const [painPoints, setPainPoints] = useState<string[]>([]);
    const [otherPainPoint, setOtherPainPoint] = useState("");
    const [idealFix, setIdealFix] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const painPointOptions = [
        "로딩 속도/끊김",
        "오디오 음질",
        "GPS 안내 정확도",
        "코스 구성/동선",
        "가격/결제"
    ];

    const togglePainPoint = (val: string) => {
        setPainPoints(prev => prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]);
    };

    const handleSurveySubmit = async () => {
        if (!tourName.trim()) return toast.error("이용하신 콘텐츠 이름을 입력해 주세요.");
        if (rating === 0) return toast.error("추천 여부(별점)를 선택해 주세요.");
        if (!idealFix.trim()) return toast.error("고치고 싶은 점을 한 가지 이상 적어주세요.");

        const finalPainPoints = [...painPoints];
        if (painPoints.includes("기타") && otherPainPoint.trim()) {
            finalPainPoints.push(`기타: ${otherPainPoint.trim()}`);
            // Remove the literal '기타' to avoid duplication in array
            const filterIdx = finalPainPoints.indexOf("기타");
            if (filterIdx > -1) finalPainPoints.splice(filterIdx, 1);
        }

        const surveyData = {
            tour_name: tourName.trim(),
            rating,
            pain_points: finalPainPoints,
            ideal_fix: idealFix.trim(),
            feedback: feedback.trim()
        };

        setIsSubmitting(true);
        await onSubmit(surveyData);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#F9F8F3] pb-20">
            <div className="max-w-[700px] mx-auto px-6 py-12">
                <button 
                    onClick={onCancel}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    나가기
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        필수 활동 만족도 조사
                    </h1>
                    <p className="text-slate-500 font-medium">
                        더 나은 투어라이브를 위해 크루님의 솔직한 경험을 들려주세요.
                    </p>
                </div>

                <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white mb-8">
                    <CardContent className="p-8 space-y-10">
                        {/* Q1 */}
                        <div>
                            <Label className="text-base font-bold text-slate-800 mb-3 block">
                                <span className="text-blue-600 mr-1">Q1.</span> 이번에 이용한 콘텐츠 이름은 무엇인가요?
                            </Label>
                            <Input
                                value={tourName}
                                onChange={(e) => setTourName(e.target.value)}
                                placeholder="예: [비엔나] 벨베데레 궁전 오디오 가이드"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-base shadow-none transition-all"
                            />
                        </div>

                        {/* Q2 */}
                        <div>
                            <Label className="text-base font-bold text-slate-800 mb-3 block">
                                <span className="text-blue-600 mr-1">Q2.</span> 이 콘텐츠를 타인에게 추천하고 싶나요?
                            </Label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={cn(
                                            "p-1.5 transition-transform hover:scale-110 rounded-full",
                                            rating >= star ? "text-[#FF5C00]" : "text-slate-200"
                                        )}
                                    >
                                        <Star className={cn("w-10 h-10", rating >= star ? "fill-[#FF5C00]" : "fill-current")} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q3 */}
                        <div>
                            <Label className="text-base font-bold text-slate-800 mb-3 block">
                                <span className="text-blue-600 mr-1">Q3.</span> 사용 중 가장 아쉬웠던 점은? (중복 선택 가능)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {painPointOptions.map((opt) => (
                                    <label key={opt} className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                                        painPoints.includes(opt) ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                                    )}>
                                        <input 
                                            type="checkbox"
                                            checked={painPoints.includes(opt)}
                                            onChange={() => togglePainPoint(opt)}
                                            className="w-5 h-5 rounded accent-blue-600"
                                        />
                                        <span className={cn("font-bold text-sm", painPoints.includes(opt) ? "text-blue-700" : "text-slate-600")}>{opt}</span>
                                    </label>
                                ))}
                                <label className={cn(
                                    "flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-colors",
                                    painPoints.includes("기타") ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox"
                                            checked={painPoints.includes("기타")}
                                            onChange={() => togglePainPoint("기타")}
                                            className="w-5 h-5 rounded accent-blue-600"
                                        />
                                        <span className={cn("font-bold text-sm", painPoints.includes("기타") ? "text-blue-700" : "text-slate-600")}>기타 (직접 입력)</span>
                                    </div>
                                    {painPoints.includes("기타") && (
                                        <Input 
                                            value={otherPainPoint}
                                            onChange={(e) => setOtherPainPoint(e.target.value)}
                                            placeholder="내용을 입력해주세요"
                                            className="h-10 mt-1 rounded-lg border-blue-200 bg-white text-sm shadow-none"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Q4 */}
                        <div>
                            <Label className="text-base font-bold text-slate-800 mb-3 block">
                                <span className="text-blue-600 mr-1">Q4.</span> 기획자라면 딱 한 가지만 고치고 싶은 점은?
                            </Label>
                            <Input
                                value={idealFix}
                                onChange={(e) => setIdealFix(e.target.value)}
                                placeholder="예: 오디오 재생 바가 더 컸으면 좋겠어요."
                                className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-base shadow-none transition-all"
                            />
                        </div>

                        {/* Q5 */}
                        <div>
                            <Label className="text-base font-bold text-slate-800 mb-3 block">
                                <span className="text-blue-600 mr-1">Q5.</span> 기타 자유로운 의견 (선택 사항)
                            </Label>
                            <textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="응원, 격려, 혹은 투어라이브에 바라는 점을 자유롭게 적어주세요!"
                                className="w-full h-32 p-4 text-sm font-medium rounded-2xl border-slate-200 bg-slate-50 focus:bg-white resize-none shadow-none focus:ring-1 focus:ring-slate-300 outline-none transition-all"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button 
                    onClick={handleSurveySubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100/50"
                >
                    {isSubmitting ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : null}
                    설문 완료 및 제출하기
                </Button>
            </div>
        </div>
    );
}


function AdditionalTasks() {
    return (
        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-800 flex items-center tracking-tight">
                    <ClipboardList className="w-6 h-6 mr-3 text-blue-600" />
                    추가 활동 및 설문
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">
                    크루 활동 품질 향상을 위한 설문에 참여해 주세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 border border-blue-50 font-black">
                            Q
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-sm font-black text-slate-800 block truncate">14기 크루 만족도 조사</span>
                            <span className="text-[10px] font-bold text-slate-400 block tracking-widest uppercase mt-0.5">진행 중 (~03/31)</span>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-blue-600 font-black hover:text-blue-700">
                        참여하기 →
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

const SIDE_MISSIONS = [
    { title: "앱 리뷰 (구글/앱스토어)", points: "10,000", type: "onetime", desc: "App store/Google play store 앱 리뷰 작성" },
    { title: "포토 리뷰 (투어라이브)", points: "2,000", type: "unlimited", desc: "오디오가이드 포토 후기 작성" },
    { title: "트랙 댓글 (투어라이브)", points: "1,000", type: "unlimited", desc: "투어라이브 오디오 가이드 트랙 댓글 (단순 감상 x오류 제보만) 작성" },
    { title: "지도 정보 오류 제보", points: "3,000", type: "unlimited", desc: "지도 정보 오류 제보" },
    { title: "이달의 챌린지", points: "N페이 지급", type: "monthly", desc: "매달 새롭게 열리는 챌린지 미션 달성 (카페/블로그)" }
];

function SideMissionBoard() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modal State
    const [selectedMission, setSelectedMission] = useState<any>(null);
    const [proofUrl, setProofUrl] = useState("");
    const [challengeTarget, setChallengeTarget] = useState("Cafe");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMissions = async () => {
        setLoading(true);
        const res = await getSideMissions();
        setMissions(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleSubmit = async () => {
        if (!proofUrl.trim()) {
            toast.error("증빙 자료(링크)를 입력해 주세요.");
            return;
        }

        setIsSubmitting(true);
        let finalTitle = selectedMission.title;
        if (selectedMission.title === "이달의 챌린지") {
            finalTitle = `${selectedMission.title} - ${challengeTarget}`;
        }

        const res = await submitSideMission(finalTitle, proofUrl);
        setIsSubmitting(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("추가 포인트 활동이 성공적으로 접수되었습니다!");
            setIsModalOpen(false);
            setProofUrl("");
            fetchMissions(); // Instant state update
        }
    };

    // Derived states
    const totalPointsEarned = missions
        .filter(m => m.status === 'APPROVED' && !m.mission_type.includes('이달의 챌린지'))
        .reduce((sum, m) => {
            const match = SIDE_MISSIONS.find(sm => 
                m.mission_type.includes(sm.title) || 
                (sm.title === "지도 정보 오류 제보" && m.mission_type.includes("지도/정보"))
            );
            if (match && typeof match.points === 'string') {
                return sum + parseInt(match.points.replace(/,/g, ''));
            }
            return sum;
        }, 0);

    const pendingCount = missions.filter(m => m.status === 'PENDING').length;

    const hasApprovedAppReview = missions.some(m => m.mission_type === "앱 리뷰 (구글/앱스토어)" && m.status === 'APPROVED');

    return (
        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4 bg-gradient-to-br from-indigo-50 to-white">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-indigo-500" />
                        추가 포인트 보드
                    </CardTitle>
                    {pendingCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-none text-[10px] font-black uppercase tracking-widest px-2.5">
                            {pendingCount} Pending
                        </Badge>
                    )}
                </div>
                
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black shadow-inner">
                        P
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Total Earned Extra</span>
                        <span className="text-2xl font-black text-indigo-900">{totalPointsEarned.toLocaleString()} <span className="text-sm font-bold text-slate-400">Pts</span></span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 space-y-3">
                {SIDE_MISSIONS.map(sm => {
                    const isAppReview = sm.title === "앱 리뷰 (구글/앱스토어)";
                    const isLocked = isAppReview && hasApprovedAppReview;
                    const pendingCountForMission = missions.filter(m => m.mission_type.includes(sm.title) && m.status === 'PENDING').length;

                    return (
                        <div key={sm.title} className={cn(
                            "group p-4 rounded-2xl border transition-all duration-300",
                            isLocked ? "bg-slate-50 border-slate-100" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md cursor-pointer"
                        )} onClick={() => {
                            if (!isLocked) {
                                setSelectedMission(sm);
                                setIsModalOpen(true);
                            }
                        }}>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className={cn("font-black text-sm", isLocked ? "text-slate-400" : "text-slate-800")}>{sm.title}</h4>
                                {isLocked ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-none font-bold">Completed ✅</Badge>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {pendingCountForMission > 0 && (
                                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                                {pendingCountForMission}건 대기 중
                                            </span>
                                        )}
                                        {missions.some(m => m.mission_type.includes(sm.title) && m.status === 'REJECTED') && (
                                            <Badge variant="outline" className="text-red-500 border-red-100 bg-red-50 font-black">반려됨</Badge>
                                        )}
                                        <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50/50 font-black">+{sm.points}</Badge>
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 leading-snug">{sm.desc}</p>
                            
                            {/* Rejected Feedback for Side Mission */}
                            {missions.filter(m => m.mission_type.includes(sm.title) && m.status === 'REJECTED').map(rm => (
                                <div key={rm.id} className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-[10px] font-bold text-red-600 flex items-start gap-2">
                                    <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span>반려 사유: {rm.admin_feedback || "증빙 자료를 다시 확인해 주세요."}</span>
                                </div>
                            ))}
                            
                            {!isLocked && (
                                <div className="mt-3 flex items-center justify-end text-[10px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    추가 제출하기 <ArrowRight className="w-3 h-3 ml-1" />
                                </div>
                            )}
                        </div>
                    );
                })}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="p-8 pb-6 bg-indigo-50">
                            <DialogTitle className="text-2xl font-black text-indigo-900 tracking-tight mb-2">
                                {selectedMission?.title} 제출
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-indigo-700/70">
                                {selectedMission?.desc} 미션을 완료하셨나요? 증빙 자료를 제출해 포인트를 획득하세요!
                            </DialogDescription>
                        </div>
                        <div className="p-8 pt-6 space-y-6">
                            {selectedMission?.title === "이달의 챌린지" && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">참여 분야 선택</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setChallengeTarget("Cafe")}
                                            className={cn("h-12 rounded-xl font-black border transition-colors", challengeTarget === "Cafe" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                                        >
                                            네이버 카페 (Cafe)
                                        </button>
                                        <button 
                                            onClick={() => setChallengeTarget("Blog")}
                                            className={cn("h-12 rounded-xl font-black border transition-colors", challengeTarget === "Blog" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
                                        >
                                            네이버 블로그 (Blog)
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700">증빙 자료 (URL 등)</Label>
                                <Input 
                                    value={proofUrl}
                                    onChange={(e) => setProofUrl(e.target.value)}
                                    placeholder="인증할 수 있는 링크(캡쳐본 링크, 블로그 주소 등) 입력" 
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm shadow-none transition-all"
                                />
                                <p className="text-[11px] text-slate-400 font-medium">* 캡쳐 이미지는 구글 드라이브나 임시 게시글 링크로 변환 후 입력해 주세요.</p>
                            </div>

                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100/50"
                            >
                                {isSubmitting ? "제출 중..." : "제출 완료하기"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

export default function MissionPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // States for inputs
    const [cafePostCount, setCafePostCount] = useState<number>(0);
    const [cafeCommentCount, setCafeCommentCount] = useState<number>(0);
    const [surveyCompleted, setSurveyCompleted] = useState<boolean>(false);
    const [isRequestingReward, setIsRequestingReward] = useState(false);
    const [isSurveyOpen, setIsSurveyOpen] = useState(false);

    async function loadData() {
        const res = await getDashboardData();
        if ('error' in res) {
            console.error(res.error);
        } else {
            setData(res);
            if (res.currentMission) {
                setCafePostCount(res.currentMission.cafe_post_count || 0);
                setCafeCommentCount(res.currentMission.cafe_comment_count || 0);
                setSurveyCompleted(res.currentMission.survey_completed || false);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F9F8F3]">
                <div className="w-8 h-8 rounded-full border-4 border-[#FF5C00] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const isBlog = data.team !== 'naver_cafe';
    const goalCount = isBlog ? 2 : 1;
    const aiVerifiedPostCount = data.currentMission?.post_url ? data.currentMission.post_url.split(',').filter(Boolean).length : 0;
    
    // Conditions
    const isBlogEligible = isBlog && aiVerifiedPostCount >= goalCount && surveyCompleted;
    const isCafeEligible = !isBlog && cafePostCount >= 5 && cafeCommentCount >= 30 && aiVerifiedPostCount >= goalCount && surveyCompleted;
    const isEligibleForReward = isBlogEligible || isCafeEligible;

    const handleRewardRequest = async () => {
        if (!data.currentMission?.id) return;
        setIsRequestingReward(true);
        const res = await requestReward(data.currentMission.id);
        if (res.error) toast.error("제출 중 오류가 발생했습니다. (컬럼 누락 등 데이터베이스 문제)");
        else {
            toast.success("최종 리워드 요청이 완료되었습니다!");
            loadData();
        }
        setIsRequestingReward(false);
    };

    const handleCafeCountChange = (type: 'post' | 'comment', val: string) => {
        const num = parseInt(val, 10);
        const safeNum = isNaN(num) || num < 0 ? 0 : num;
        
        let newPost = cafePostCount;
        let newComment = cafeCommentCount;
        if (type === 'post') { setCafePostCount(safeNum); newPost = safeNum; }
        else { setCafeCommentCount(safeNum); newComment = safeNum; }

        if (data.currentMission?.id) {
            updateCafeCounts(data.currentMission.id, newPost, newComment).catch(console.error);
        }
    };

    const handleSurveyToggle = async (surveyData: any) => {
        if (!data.currentMission?.id) return;
        const res = await submitSurvey(data.currentMission.id, surveyData);
        if (res.error) {
            toast.error(res.error);
        } else {
            setSurveyCompleted(true);
            setIsSurveyOpen(false);
            toast.success("설문이 제출되었습니다! 포인트/선물 지급 조건에 반영되었습니다.");
            loadData();
        }
    };

    if (isSurveyOpen) {
        return (
            <SurveyView 
                onSubmit={handleSurveyToggle} 
                onCancel={() => setIsSurveyOpen(false)} 
            />
        );
    }

    return (
        <div className="pb-20 animate-in fade-in duration-500">
            <div className="max-w-[1000px] mx-auto px-6 py-10 lg:py-16">
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-sm mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    대시보드로 돌아가기
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
                        필수 활동 현황
                    </h1>
                    <p className="text-slate-500 font-medium">
                        진행 중인 미션을 완료하고 성과를 제출해 주세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <MissionSubmissionCard 
                        currentMission={data.currentMission} 
                        goalCount={goalCount} 
                        isCafeTeam={!isBlog} 
                        onRefresh={loadData}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-lg font-black text-slate-800 flex items-center tracking-tight">
                                            {!isBlog ? <Coffee className="w-5 h-5 mr-3 text-[#FF5C00]" /> : <BookOpen className="w-5 h-5 mr-3 text-[#0052CC]" />}
                                            활동 목표
                                        </CardTitle>
                                        <button 
                                            onClick={() => {
                                                loadData();
                                                toast.success("상태를 새로고침했습니다.");
                                            }}
                                            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                                            title="새로고침"
                                        >
                                            <RefreshCcw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                                        {!isBlog ? "Cafe Team" : "Blog Team"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-2 flex flex-col h-[calc(100%-80px)] justify-between">
                                <div className="space-y-4">
                                    {!isBlog ? (
                                        <>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm font-bold text-slate-600">
                                                <span>여행 정보 게시글 📝</span>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        value={cafePostCount || ''} 
                                                        onChange={(e) => handleCafeCountChange('post', e.target.value)}
                                                        className="w-20 h-8 text-right font-black shadow-none" 
                                                        placeholder="0"
                                                    />
                                                    <span className="font-black text-slate-800 shrink-0 w-8">/ 5</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm font-bold text-slate-600">
                                                <span>카페 소통 댓글 💬</span>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        value={cafeCommentCount || ''} 
                                                        onChange={(e) => handleCafeCountChange('comment', e.target.value)}
                                                        className="w-20 h-8 text-right font-black shadow-none" 
                                                        placeholder="0"
                                                    />
                                                    <span className="font-black text-slate-800 shrink-0 w-8">/ 30</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : null}

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F0F5FF]/50 text-sm font-black text-[#0052CC] border border-[#D6E4FF]">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="w-5 h-5" />
                                            <span>가이드북 사용후기</span>
                                        </div>
                                        <span className="text-lg">{aiVerifiedPostCount} / {goalCount}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 text-sm font-black border border-slate-200">
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <ClipboardList className="w-5 h-5" />
                                            <span>필수 설문 참여</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {surveyCompleted ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">참여 완료 ✅</Badge>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setIsSurveyOpen(true)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 px-4"
                                                >
                                                    지금 참여하기
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <Button
                                        onClick={handleRewardRequest}
                                        disabled={!isEligibleForReward || isRequestingReward || data.currentMission?.status === 'PENDING_APPROVAL' || data.currentMission?.status === 'completed'}
                                        className="w-full h-14 rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black shadow-lg shadow-orange-100/50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
                                    >
                                        {isRequestingReward ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 
                                         data.currentMission?.status === 'PENDING_APPROVAL' ? "최종 승인 대기 중" :
                                         data.currentMission?.status === 'completed' ? "모든 미션 완료 🏆" :
                                        "미션 최종 완료하기"}
                                    </Button>
                                    {!isEligibleForReward && (
                                        <p className="text-[10px] text-center font-bold text-slate-400">
                                            모든 활동 목표(게시글/댓글/설문)를 달성해야 제출할 수 있습니다.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <SideMissionBoard />
                    </div>
                </div>
            </div>
        </div>
    );
}
