"use client";

import { useEffect, useState } from "react";
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
import { submitMission, registerNaverId, syncCafeActivity } from "@/app/actions/mission";
import { signOut } from "@/app/actions/auth";
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
    const [naverIdInput, setNaverIdInput] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const router = useRouter();

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
        }
        setIsRegistering(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        const res = await syncCafeActivity(profile.naver_id);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("활동 내역이 업데이트되었습니다!");
            onRefresh();
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
                        Cafe Automation
                    </Badge>
                </div>
                <CardDescription className="text-slate-500 font-medium mt-1">
                    카페 활동 현황을 실시간으로 확인하고 관리하세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {profile?.naver_id ? (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-500">연동된 네이버 ID</span>
                                </div>
                                <span className="text-sm font-black text-slate-800">{profile.naver_id}</span>
                            </div>
                            <Button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="h-14 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black flex items-center gap-2 shadow-lg shadow-slate-200 shrink-0"
                            >
                                {isSyncing ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCcw className="w-4 h-4" />
                                )}
                                활동 내역 업데이트
                            </Button>
                        </div>
                        
                        <div className="px-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Auto Tracking Active</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">최근 업데이트: {lastUpdated}</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600">여행 정보 게시글 작성</span>
                                    <span className="text-xs font-black text-[#FF5C00]">{postCount} / 5개</span>
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
                                    <span className="text-xs font-black text-slate-800">{commentCount} / 30개</span>
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
