"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, LogIn, Lock } from "lucide-react";

export default function LoginPage() {
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const result = await signIn(formData);

        if (result?.error) {
            toast.error(result.error);
            setIsPending(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans antialiased">
            <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="pt-12 pb-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                        <Lock className="w-6 h-6 text-slate-400" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                        투어라이브 크루 로그인
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-3">
                        활동 대시보드 접근을 위해 계정 정보를 입력하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-bold ml-1">투어라이브 계정 (이메일)</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tourlive@example.com"
                                required
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-base placeholder:text-slate-300 shadow-none focus:ring-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-bold ml-1">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="******"
                                required
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-base placeholder:text-slate-300 shadow-none focus:ring-slate-200"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-[#FF5C00] hover:bg-[#E65300] text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98] border-none text-lg mt-4"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "로그인"}
                        </Button>
                    </form>
                    <div className="mt-10 text-center border-t border-slate-50 pt-8">
                        <p className="text-sm text-slate-400 font-medium">
                            아직 크루 신청을 안 하셨나요?{" "}
                            <Link href="/onboarding" className="text-[#FF5C00] font-bold hover:underline transition-all">
                                신규 가입하기
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
