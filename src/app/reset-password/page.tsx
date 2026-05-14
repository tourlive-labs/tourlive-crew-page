"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [ready, setReady] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) {
            toast.error("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (password.length < 6) {
            toast.error("비밀번호는 6자 이상이어야 합니다.");
            return;
        }
        setIsPending(true);
        const { error } = await supabase.auth.updateUser({ password });
        setIsPending(false);
        if (error) {
            toast.error("비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다.");
            return;
        }
        toast.success("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
        await supabase.auth.signOut();
        router.push("/login");
    }

    if (!ready) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
                <div className="text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium">인증 링크 확인 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-sans antialiased">
            <Card className="w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none rounded-brand-lg overflow-hidden bg-white">
                <CardHeader className="pt-12 pb-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                        <KeyRound className="w-6 h-6 text-slate-400" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                        새 비밀번호 설정
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-3">
                        새로운 비밀번호를 입력해 주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-bold ml-1">새 비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6자 이상"
                                required
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-base placeholder:text-slate-300 shadow-none focus:ring-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-slate-700 font-bold ml-1">비밀번호 확인</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="비밀번호 재입력"
                                required
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-base placeholder:text-slate-300 shadow-none focus:ring-slate-200"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98] border-none text-lg mt-4"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "비밀번호 변경"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
