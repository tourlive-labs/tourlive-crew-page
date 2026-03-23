"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
    ArrowLeft,
    Trophy,
    Target,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    Coffee,
    BookOpen,
    MessageSquare,
    RefreshCcw,
    ClipboardList,
    Smartphone
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { submitMission, registerNaverId, processCafeScreenshot, confirmCafeActivity, setCafeBaseline } from "@/app/actions/mission";
import { signOut } from "@/app/actions/auth";
import { Camera, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function MissionSubmissionCard({ currentMission }: { currentMission: any }) {
    const [link, setLink] = useState(currentMission?.post_url || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const isSubmitted = currentMission?.status && currentMission.status !== 'none';
    const statusText = currentMission?.status === 'checking' ? 'AI 검토 중' : 
                      currentMission?.status === 'completed' ? '검토 완료' : 
                      currentMission?.status === 'rejected' ? '반려됨' : '미제출';

    const handleLinkSubmit = async () => {
        if (!link) return;
        setIsSubmitting(true);
        const res = await submitMission(link);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("미션이 제출되었습니다! AI 검토가 시작됩니다.");
            router.refresh();
        }
        setIsSubmitting(false);
    };

    return (
        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white mb-8">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between bg-slate-50/50">
                <div>
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center tracking-tight">
                        <Trophy className="w-6 h-6 mr-3 text-[#FF5C00]" />
                        이달의 필수 활동 제출
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-1">
                        블로그 또는 카페 활동 중인 링크를 제출해 주세요.
                    </CardDescription>
                </div>
                {isSubmitted && (
                    <Badge className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        currentMission.status === 'checking' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                        currentMission.status === 'completed' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        "bg-red-50 text-red-600 border border-red-100"
                    )}>
                        {statusText}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-8">
                {isSubmitted ? (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0 border border-slate-100">
                                    <ExternalLink className="w-6 h-6" />
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-0.5">제출된 링크</span>
                                    <span className="text-sm font-bold text-slate-700 truncate block">{currentMission.post_url}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200">
                                 <a href={currentMission.post_url} target="_blank" rel="noopener noreferrer">
                                    바로가기
                                 </a>
                            </Button>
                        </div>

                        {currentMission.status === 'rejected' && (
                            <div className="p-6 rounded-2xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h4 className="text-sm font-black text-red-800 mb-2 flex items-center gap-2">
                                    <RefreshCcw className="w-4 h-4" />
                                    AI 검토 결과: 수정 요청
                                </h4>
                                <p className="text-sm text-red-700 leading-relaxed font-medium">
                                    {currentMission.ai_feedback || "필수 하단 멘트가 누락되었거나 이미지 개수가 부족합니다. 내용을 수정 후 다시 제출해 주세요."}
                                </p>
                                <div className="mt-4 pt-4 border-t border-red-100">
                                    <Input
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="수정한 링크를 다시 입력하세요"
                                        className="h-12 rounded-xl border-red-200 bg-white focus:ring-red-100 mb-3"
                                    />
                                    <Button 
                                        onClick={handleLinkSubmit}
                                        disabled={!link || isSubmitting}
                                        className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black"
                                    >
                                        다시 제출하기
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentMission.status === 'checking' && (
                            <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <RefreshCcw className="w-5 h-5 text-orange-500 animate-spin" />
                                </div>
                                <p className="text-sm text-orange-800 font-bold">
                                    AI가 제출하신 내용을 실시간으로 검토하고 있습니다. 잠시만 기다려 주세요.
                                </p>
                            </div>
                        )}

                        {currentMission.status === 'completed' && (
                            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-sm text-blue-800 font-bold">
                                    미션이 성공적으로 검토되었습니다! 활동 성과가 반영되었습니다.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100/50">
                            <h4 className="text-sm font-black text-orange-800 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                필수 체크리스트
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
                            <Label className="text-sm font-black text-slate-700 ml-1">제출 링크</Label>
                            <Input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://blog.naver.com/..."
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-base shadow-none transition-all"
                            />
                            <Button 
                                onClick={handleLinkSubmit}
                                disabled={!link || isSubmitting}
                                className="h-14 w-full rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black shadow-lg shadow-orange-100/50 mt-2"
                            >
                                {isSubmitting ? (
                                    <RefreshCcw className="w-5 h-5 animate-spin" />
                                ) : "최종 미션 제출하기"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CafeActivityCard({ 
    profile, 
    currentMission, 
    onRefresh 
}: { 
    profile: any, 
    currentMission: any, 
    onRefresh: () => void 
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [naverIdInput, setNaverIdInput] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [extractedData, setExtractedData] = useState<{posts: number, comments: number} | null>(null);
    const [uploadMode, setUploadMode] = useState<'activity' | 'baseline'>('activity');
    const router = useRouter();

    const baselinePosts = currentMission?.baseline_post_count;
    const baselineComments = currentMission?.baseline_comment_count;
    const hasBaseline = baselinePosts != null && baselineComments != null;

    const postCount = currentMission?.cafe_post_count || 0;
    const commentCount = currentMission?.cafe_comment_count || 0;
    const postProgress = Math.min((postCount / 5) * 100, 100);
    const commentProgress = Math.min((commentCount / 30) * 100, 100);
    
    const lastUpdated = currentMission?.updated_at 
        ? new Date(currentMission.updated_at).toLocaleString('ko-KR', { 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        }) 
        : "기록 없음";

    const handleRegister = async () => {
        if (!naverIdInput) return;
        setIsRegistering(true);
        const res = await registerNaverId(naverIdInput);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("네이버 ID가 성공적으로 등록되었습니다!");
            onRefresh();
            router.refresh();
        }
        setIsRegistering(false);
    };

    const handleUploadClick = (mode: 'activity' | 'baseline') => {
        setUploadMode(mode);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const base64String = reader.result as string;
            setIsUploading(true);
            const res = await processCafeScreenshot(base64String);
            if (res.error) {
                toast.error(res.error);
            } else if (res.success) {
                setExtractedData({ posts: res.posts!, comments: res.comments! });
                toast.success("이미지 분석 완료! 결과를 확인해주세요.");
            }
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleConfirm = async () => {
        if (!extractedData) return;
        setIsSyncing(true);
        let res;
        if (uploadMode === 'baseline') {
            res = await setCafeBaseline(extractedData.posts, extractedData.comments);
        } else {
            res = await confirmCafeActivity(extractedData.posts, extractedData.comments);
        }

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(uploadMode === 'baseline' ? "기수 시작점이 성공적으로 설정되었습니다!" : "활동 내역이 성공적으로 업데이트되었습니다!");
            setExtractedData(null);
            onRefresh();
            router.refresh();
        }
        setIsSyncing(false);
    };

    return (
        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center tracking-tight">
                        <Coffee className="w-6 h-6 mr-3 text-[#FF5C00]" />
                        네이버 카페 활동 현황
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        AI Vision
                    </Badge>
                </div>
                <CardDescription className="text-slate-500 font-medium mt-1">
                    카페 활동 현황을 실시간으로 확인하고 관리하세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {profile?.naver_id ? (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                        <Smartphone className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">연동된 네이버 ID</span>
                                        <span className="text-sm font-black text-slate-800">{profile.naver_id}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="rounded-xl border-[#FF5C00] text-[#FF5C00] hover:bg-[#FFF5F1]">
                                    <a href="https://m.cafe.naver.com/ca-fe/jisiktravel" target="_blank" rel="noopener noreferrer">
                                        카페 홈 바로가기
                                    </a>
                                </Button>
                            </div>

                            {/* Hidden File Input */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="hidden"
                            />

                            {extractedData ? (
                                <div className="p-6 rounded-2xl bg-orange-50 border border-orange-200 animate-in fade-in slide-in-from-bottom-2">
                                    <h4 className="text-sm font-black text-orange-900 mb-4 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-2 text-orange-600" />
                                        AI 분석 완료! 숫자가 맞나요?
                                    </h4>
                                    <div className="flex items-center justify-around bg-white p-4 rounded-xl border border-orange-100 mb-4">
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-slate-400 block mb-1">작성글</span>
                                            <span className="text-2xl font-black text-slate-800">{extractedData.posts}건</span>
                                        </div>
                                        <div className="w-px h-10 bg-slate-100" />
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-slate-400 block mb-1">작성댓글</span>
                                            <span className="text-2xl font-black text-slate-800">{extractedData.comments}건</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setExtractedData(null)}
                                            disabled={isSyncing}
                                            className="flex-1 h-12 rounded-xl bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
                                        >
                                            다시 캡처하기
                                        </Button>
                                        <Button 
                                            onClick={handleConfirm}
                                            disabled={isSyncing}
                                            className="flex-1 h-12 rounded-xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black"
                                        >
                                            {isSyncing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "맞습니다 (저장)"}
                                        </Button>
                                    </div>
                                </div>
                            ) : isUploading ? (
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 border-dashed relative text-center flex flex-col items-center justify-center space-y-3 py-10">
                                    <RefreshCcw className="w-8 h-8 text-slate-400 animate-spin" />
                                    <h4 className="text-sm font-black text-slate-800">AI가 이미지를 분석 중입니다...</h4>
                                </div>
                            ) : !hasBaseline ? (
                                <div className="p-6 rounded-2xl bg-orange-50 border border-orange-200 text-center space-y-4 shadow-sm animate-in fade-in">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-orange-100 mb-2">
                                        <Target className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-black text-orange-900">이번 기수의 시작점을 설정해주세요</h4>
                                        <p className="text-xs text-orange-700 max-w-[280px] mx-auto leading-relaxed">
                                            현재 카페 활동량(작성글/댓글 수)을 먼저 기준점으로 등록해야, 새롭게 활동한 '순수 활동량'을 계산할 수 있습니다.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => handleUploadClick('baseline')} 
                                        className="h-12 px-6 w-full rounded-xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black shadow-lg shadow-orange-200"
                                    >
                                        초기 시작점 캡처 업로드하기
                                    </Button>
                                    <p className="text-[10px] text-orange-500 font-bold mt-2">
                                        ※ 기존 활동 내역 화면과 동일하게 캡처해주세요.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div 
                                        className="p-6 rounded-2xl bg-slate-50 border border-slate-200 border-dashed relative hover:bg-slate-100 transition-colors cursor-pointer animate-in fade-in"
                                        onClick={() => handleUploadClick('activity')}
                                    >
                                        <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
                                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                                <ImageIcon className="w-6 h-6 text-[#FF5C00]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 mb-1">
                                                    활동 내역 캡처 업데이트
                                                </h4>
                                                <p className="text-xs font-medium text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                                                    카페 상단 메뉴(≡) &gt; 내 프로필 &gt; <b>'내 활동'</b> 탭에서 <br/>
                                                    작성글/댓글 수가 보이게 캡처해 주세요.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleUploadClick('baseline')} 
                                            className="text-[11px] text-slate-400 hover:text-slate-600 underline font-semibold"
                                        >
                                            기수 시작점 잘못 설정하셨나요? 갱신하기
                                        </Button>
                                    </div>
                                    
                                    <div className="px-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#FF5C00]" />
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AI VISION TRACKER</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400">최근 업데이트: {lastUpdated}</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-600">여행 정보 게시글 작성</span>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-400 mb-0.5">(시작 시점 {baselinePosts}개)</span>
                                                    <span className="text-xs font-black text-[#FF5C00]">이번 달: {postCount} / 5개</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[#FF5C00] transition-all duration-700 ease-out rounded-full"
                                                    style={{ width: `${postProgress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-600">커뮤니티 댓글 작성</span>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-400 mb-0.5">(시작 시점 {baselineComments}개)</span>
                                                    <span className="text-xs font-black text-slate-800">이번 달: {commentCount} / 30개</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-slate-800 transition-all duration-700 ease-out rounded-full"
                                                    style={{ width: `${commentProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-[#F9F8F3] border border-[#F1EADA] space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-800">네이버 ID 등록이 필요합니다</h4>
                            <p className="text-xs text-slate-500 font-medium">활동 현황을 자동으로 집계하기 위해 네이버 ID(이메일 아님)를 등록해 주세요.</p>
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="네이버 ID 입력 (예: tourlive)" 
                                value={naverIdInput}
                                onChange={(e) => setNaverIdInput(e.target.value)}
                                className="h-11 rounded-xl border-slate-200 bg-white"
                            />
                            <Button 
                                onClick={handleRegister}
                                disabled={!naverIdInput || isRegistering}
                                className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black"
                            >
                                {isRegistering ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "등록"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
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

export default function MissionPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function loadData() {
        const res = await getDashboardData();
        if ('error' in res) {
            console.error(res.error);
        } else {
            setData(res);
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

    return (
        <div className="min-h-screen bg-[#F9F8F3] pb-20">
            <div className="max-w-[1000px] mx-auto px-6 py-12">
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    대시보드로 돌아가기
                </Link>

                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                            필수 활동 현황
                        </h1>
                        <p className="text-slate-500 font-medium">
                            진행 중인 미션을 완료하고 성과를 제출해 주세요.
                        </p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => signOut()}
                        className="text-slate-400 hover:text-slate-900 font-bold text-xs"
                    >
                        로그아웃
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {data.team === 'naver_cafe' && (
                        <CafeActivityCard 
                            profile={data} 
                            currentMission={data.currentMission} 
                            onRefresh={loadData}
                        />
                    )}
                    
                    <MissionSubmissionCard currentMission={data.currentMission} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <CardTitle className="text-lg font-black text-slate-800 flex items-center tracking-tight">
                                        {data.team === 'naver_cafe' ? <Coffee className="w-5 h-5 mr-3 text-[#FF5C00]" /> : <BookOpen className="w-5 h-5 mr-3 text-[#0052CC]" />}
                                        활동 목표
                                    </CardTitle>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                                        {data.team === 'naver_cafe' ? "Cafe Team" : "Blog Team"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-2 space-y-3">
                                {data.team === 'naver_cafe' ? (
                                    <>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm font-bold text-slate-600">
                                            <span>여행 정보 게시글</span>
                                            <span className="font-black text-slate-800">0/5개</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm font-bold text-slate-600">
                                            <span>커뮤니티 댓글</span>
                                            <span className="font-black text-slate-800">0/30개</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF5F1] text-sm font-black text-[#FF5C00] border border-[#FFD9C6]">
                                            <span>가이드북 사용후기</span>
                                            <span>0/1개</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-[#F0F5FF]/30 text-sm font-black text-[#0052CC] border border-[#D6E4FF]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0052CC] shadow-sm">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span>가이드북 사용후기</span>
                                        </div>
                                        <span className="text-xl">0/2개</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <AdditionalTasks />
                    </div>
                </div>
            </div>
        </div>
    );
}
