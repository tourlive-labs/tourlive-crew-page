"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PartyPopper, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function DashboardContent() {
    const searchParams = useSearchParams();
    const nickname = searchParams.get("nickname") || "크루";

    return (
        <Card className="w-full max-w-lg overflow-hidden border-orange-100 shadow-xl bg-white rounded-2xl">
            <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />
            <CardHeader className="text-center pt-8 pb-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <PartyPopper className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
                    가입을 축하합니다!
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8 pb-10">
                <div className="space-y-6">
                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                        <p className="text-xl text-gray-700 leading-relaxed font-medium">
                            반갑습니다, <span className="text-orange-600 font-bold underline underline-offset-4">{nickname}</span>님!<br />
                            14기 활동을 환영합니다.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-left bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-sm text-gray-600">회원가입이 정상적으로 완료되었습니다.</p>
                        </div>
                        <div className="flex items-center space-x-3 text-left bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-sm text-gray-600">배너 이미지가 안전하게 업로드되었습니다.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <Button asChild className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-12 rounded-xl text-lg font-semibold transition-all hover:scale-[1.02]">
                            <Link href="/manage">활동 대시보드 가기</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 h-12 rounded-xl text-lg font-semibold transition-all">
                            <Link href="/">메인으로 가기</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-orange-50/30 flex items-center justify-center p-4">
            <Suspense fallback={
                <Card className="w-full max-w-lg border-orange-100 shadow-xl bg-white rounded-2xl p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
                    <p className="mt-4 text-orange-900/60 font-medium">로딩 중...</p>
                </Card>
            }>
                <DashboardContent />
            </Suspense>
        </div>
    );
}
