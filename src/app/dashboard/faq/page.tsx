"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, MessageSquare, ExternalLink, Download, Sparkles } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import PageHeader from "@/components/shared/PageHeader";

export default function FAQPage() {
    const faqs = [
        {
            q: "포인트 미리 지급 받을 수 있나요?",
            a: "불가능합니다! 한 달 활동 후 제출 확인 시 지급됩니다.",
            highlight: "단, 빠른 지급 원할 시 활동 제출 폼 조기 작성 시 3영업일 이내 지급 가능 😎"
        },
        {
            q: "닉네임, 배너를 수정하고 싶어요.",
            a: "root@tourlive.co.kr로 메일 주세요! 직접 포토샵 수정도 가능합니다."
        },
        {
            q: "포스팅 할 수 있는 지역이 정해져있나요?",
            a: "**[오디오 가이드 사용 후기]**는 지정된 지역/투어 필수(월 1회). 일반 여행 정보는 지역 상관없이 포스팅 가능합니다."
        },
        {
            q: "포인트는 어떻게 사용할 수 있나요?",
            a: "웹사이트(www.tourlive.co.kr)에서만 사용 가능! 앱 결제 시 환불이 어려우니 주의해주세요."
        },
        {
            q: "발대식 자료 주세요!",
            a: "아래 링크에서 발대식 자료를 다운로드하실 수 있습니다.",
            link: {
                label: "발대식 자료 다운로드",
                href: "https://drive.google.com/file/d/11LhY1t4zUWIOBMjmVXk958BnLWnMuE24/view?usp=drive_link"
            }
        }
    ];

    return (
        <div className="min-h-screen bg-brand-bg pb-20">
            <div className="max-w-[1000px] mx-auto px-6 py-12">
                <div className="mb-12">
                    <PageHeader
                        title="자주 묻는 질문 (FAQ)"
                        subtitle="크루 활동 중 궁금하신 점을 확인해 보세요."
                        backHref="/dashboard"
                        right={
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut()}
                                className="text-slate-400 hover:text-slate-900 font-bold text-xs"
                            >
                                로그아웃
                            </Button>
                        }
                    />
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, idx) => (
                        <Card key={idx} className="shadow-sm border-slate-100 rounded-brand overflow-hidden bg-white group hover:shadow-md transition-all duration-300">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black text-slate-800 flex items-start gap-3 leading-snug">
                                    <span className="text-brand-primary shrink-0">Q.</span>
                                    {faq.q}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-4">
                                <div className="flex gap-3">
                                    <span className="text-slate-300 font-black shrink-0">A.</span>
                                    <div className="space-y-3">
                                        <p className="text-slate-600 font-medium leading-relaxed">
                                            {faq.a.includes("**[") ? (
                                                <>
                                                    <span className="text-slate-900 font-black">[오디오 가이드 사용 후기]</span>
                                                    {faq.a.split("]")[1]}
                                                </>
                                            ) : faq.a}
                                        </p>
                                        
                                        {faq.highlight && (
                                            <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 flex items-start gap-3">
                                                <Sparkles className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                                                <p className="text-sm font-bold text-brand-primary leading-normal">
                                                    {faq.highlight}
                                                </p>
                                            </div>
                                        )}

                                        {faq.link && (
                                            <Button asChild variant="outline" className="rounded-xl border-slate-200 gap-2 mt-2">
                                                <a href={faq.link.href} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4" />
                                                    {faq.link.label}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="mt-16 text-center">
                        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-brand-xl bg-slate-100/50 border border-slate-200">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-900 font-black">추가 질문이 있으신가요?</p>
                                <p className="text-slate-500 font-medium text-sm">
                                    <a href="mailto:root@tourlive.co.kr" className="text-brand-primary hover:underline">root@tourlive.co.kr</a>로 문의해 주세요.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
