import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getNotices } from "@/app/actions/notices";
import NoticesClient from "./NoticesClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft, Megaphone } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export default async function AdminNoticesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr";
    if (!isAdmin) redirect("/dashboard");

    let notices: import("@/app/actions/notices").Notice[] = [];
    let fetchError: string | null = null;

    const noticesResult = await getNotices();
    if ('error' in noticesResult) {
        fetchError = noticesResult.error;
    } else {
        notices = noticesResult;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 border-t-[12px] border-orange-500">
            <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            관리자 홈
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">관리자</span>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Megaphone className="w-7 h-7 text-orange-500" />
                                공지사항 관리
                            </h1>
                        </div>
                        <p className="text-slate-400 font-bold">크루 포털 공지사항을 등록·수정·삭제합니다.</p>
                    </div>

                    <form action={signOut}>
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl gap-2 font-bold px-5 h-11 transition-all border border-slate-100 bg-white shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </Button>
                    </form>
                </div>

                {fetchError ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-brand-xl border border-slate-100 text-center">
                        <p className="text-slate-800 font-bold">데이터를 불러오지 못했습니다</p>
                        <p className="text-xs text-slate-300 font-mono">{fetchError}</p>
                        <p className="text-sm text-slate-500 font-medium">
                            Supabase에서 <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">notices</code> 테이블이 생성되었는지 확인하세요.
                        </p>
                        <Link href="/admin/notices" className="mt-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-700 transition-colors">
                            새로고침
                        </Link>
                    </div>
                ) : (
                    <NoticesClient initialNotices={notices} />
                )}
            </div>
        </div>
    );
}
