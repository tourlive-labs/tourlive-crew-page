"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, requestPasswordReset } from "@/app/actions/auth";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [isPending, setIsPending] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [isResetPending, setIsResetPending] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const router = useRouter();

    async function handleResetSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsResetPending(true);
        const result = await requestPasswordReset(resetEmail);
        setIsResetPending(false);
        if (result?.error) {
            toast.error(result.error);
        } else {
            setResetSent(true);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        const result = await signIn(formData);

        if (result?.error) {
            toast.error(result.error);
            setIsPending(false);
        } else if (result?.success && result.redirectTo) {
            router.push(result.redirectTo);
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans antialiased">
            <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none rounded-brand-lg overflow-hidden bg-white">
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
                            className="w-full h-14 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98] border-none text-lg mt-4"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "로그인"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => { setShowReset(!showReset); setResetSent(false); setResetEmail(""); }}
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            비밀번호를 잊으셨나요?
                        </button>
                    </div>

                    {showReset && (
                        <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            {resetSent ? (
                                <p className="text-sm text-center text-slate-600 font-medium">
                                    ✉️ 재설정 링크를 이메일로 보내드렸어요.<br />
                                    <span className="text-slate-400 text-xs">메일함을 확인해 주세요.</span>
                                </p>
                            ) : (
                                <form onSubmit={handleResetSubmit} className="space-y-3">
                                    <p className="text-xs text-slate-500 font-medium mb-2">가입하신 이메일로 재설정 링크를 보내드려요.</p>
                                    <Input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        placeholder="가입한 이메일 입력"
                                        required
                                        className="h-11 rounded-xl border-slate-200 bg-white text-sm placeholder:text-slate-300"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isResetPending}
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-slate-200 text-slate-700 text-sm font-bold"
                                    >
                                        {isResetPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "재설정 링크 보내기"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-center border-t border-slate-50 pt-8">
                        <p className="text-sm text-slate-400 font-medium">
                            아직 크루 신청을 안 하셨나요?{" "}
                            <Link href="/onboarding" className="text-brand-primary font-bold hover:underline transition-all">
                                신규 가입하기
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
