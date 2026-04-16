"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    BookOpen,
    Coffee,
    Target,
    CheckCircle2,
    AlertCircle,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Quote
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-brand-bg selection:bg-brand-primary selection:text-white font-sans antialiased py-16 px-10">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <PageHeader
                        title="크루 활동 가이드라인"
                        subtitle="성공적인 투어라이브 크루 활동을 위한 상세 지침서입니다."
                        backHref="/dashboard"
                        badge="Manual"
                        badgeSub="Activity Guide v1.0"
                    />
                </div>

                <div className="grid gap-10">
                    {/* Cafe Section */}
                    <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-brand-xl overflow-hidden bg-white p-2">
                        <CardHeader className="p-10 pb-4">
                            <div className="w-16 h-16 rounded-brand bg-brand-primary/5 flex items-center justify-center text-brand-primary mb-6">
                                <Coffee className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">네이버 지식카페 활동</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-2">
                                여행 정보 공유를 통해 커뮤니티 성장에 기여합니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-8">
                            <div className="grid sm:grid-cols-3 gap-6">
                                <div className="p-6 rounded-brand bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Requirement 01</span>
                                    <h4 className="font-extrabold text-slate-800 text-base leading-tight">여행 정보게시글</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">월 5건 이상의 유익한 여행 정보를 공유해 주세요.</p>
                                </div>
                                <div className="p-6 rounded-brand bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Requirement 02</span>
                                    <h4 className="font-extrabold text-slate-800 text-base leading-tight">활발한 댓글 참여</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">월 30건 이상의 소통 댓글을 남겨주세요.</p>
                                </div>
                                <div className="p-6 rounded-brand bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Requirement 03</span>
                                    <h4 className="font-extrabold text-slate-800 text-base leading-tight">사용후기 미션</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">매월 지정된 사용후기 게시글 1건을 작성합니다.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Blog Section */}
                    <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-brand-xl overflow-hidden bg-white p-2">
                        <CardHeader className="p-10 pb-4">
                            <div className="w-16 h-16 rounded-brand bg-[#F0F5FF] flex items-center justify-center text-[#0052CC] mb-6">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">네이버 블로그 활동</CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-2">
                                투어라이브의 가이드북과 오디오 가이드를 풍성하게 리뷰합니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="p-6 rounded-brand bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Requirement</span>
                                    <h4 className="font-extrabold text-slate-800 text-base leading-tight">리뷰 게시글 작성</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">월 2건의 투어라이브 상품(가이드북/오디오가이드) 상세 리뷰를 작성합니다.</p>
                                </div>
                                <div className="p-6 rounded-brand bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Checklist</span>
                                    <h4 className="font-extrabold text-slate-800 text-base leading-tight">필수 항목 준수</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">아래의 5대 필수 항목을 반드시 포함하여 작성해야 합니다.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checklist Section */}
                    <Card className="shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-brand-xl overflow-hidden bg-slate-900 text-white p-2">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tight">5-Point Checklist</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium mt-2">
                                        사용후기글 작성 시 반드시 지켜야 할 5가지 규칙입니다.
                                    </CardDescription>
                                </div>
                                <Target className="w-12 h-12 text-brand-primary opacity-20" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 grid gap-4">
                            {[
                                { title: "어플 캡처", desc: "투어라이브 앱 캡처 사진 5장 이상", icon: ImageIcon },
                                { title: "직접 촬영", desc: "본인이 직접 찍은 사진 5장 이상", icon: ImageIcon },
                                { title: "UTM 링크", desc: "크루 ID가 포함된 상품 링크 삽입", icon: LinkIcon },
                                { title: "하단 배너", desc: "투어라이브 크루 공식 배너 이미지", icon: FileText },
                                { title: "필수 문구", desc: "원고료 기재 등 필수 하단 멘트 포함", icon: Quote },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-5 rounded-brand bg-slate-800/50 border border-white/5 group hover:bg-slate-800 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all shrink-0 font-black">
                                        {idx + 1}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-extrabold text-base whitespace-nowrap truncate">{item.title}</h4>
                                        <p className="text-slate-400 text-sm font-medium whitespace-nowrap truncate">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Need Help?</p>
                    <div className="flex justify-center gap-4">
                        <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 font-black hover:bg-white hover:shadow-md transition-all">
                            <a href="mailto:root@tourlive.co.kr">관리자에게 문의하기</a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
