import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CrewManagementClient } from "@/components/CrewManagementClient";
import { signOut } from "@/app/actions/auth";

export default async function AdminPage() {
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

    // Fetch all profiles with their batch info
    const { data: crewMembers, error: fetchError } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            tourlive_email,
            contact_email,
            selected_activity,
            nickname,
            naver_id,
            batch,
            created_at,
            missions (
                id,
                status,
                points_granted,
                mission_month,
                post_url
            )
        `)
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

    if (fetchError) {
        return (
            <div className="min-h-screen bg-brand-bg p-8 font-sans antialiased text-slate-900 border-t-[12px] border-orange-500 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-brand-lg p-10 shadow-sm text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">데이터를 불러오지 못했습니다</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        크루 멤버 정보를 가져오는 중 오류가 발생했습니다.<br />
                        잠시 후 다시 시도해주세요.
                    </p>
                    <p className="text-xs text-slate-300 font-mono break-all">{fetchError.message}</p>
                    <Link href="/admin" className="inline-block mt-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-700 transition-colors">
                        다시 시도
                    </Link>
                </div>
            </div>
        );
    }

    // Get unique batches for the filter
    // .trim() neutralizes any trailing/leading whitespace that would create phantom duplicates in Set
    const rawBatches = crewMembers?.map(m => m.batch?.trim()).filter(Boolean) ?? [];
    const batches = Array.from(new Set(rawBatches)).sort((a, b) => {
        // Descending numeric sort (15기, 14기, ...)
        // Safe parseInt fallback: non-numeric names (e.g. "특별기") are sorted to the end
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
        if (!isNaN(numA)) return -1; // numeric before non-numeric
        if (!isNaN(numB)) return 1;
        return b.localeCompare(a); // both non-numeric: alphabetical descending
    }) as string[];

    return (
        <div className="min-h-screen bg-brand-bg p-8 font-sans antialiased text-slate-900 border-t-[12px] border-orange-500">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">Admin Portal</span>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">크루 멤버 관리</h1>
                        </div>
                        <p className="text-slate-400 font-bold text-lg">전체 기수 활동 현황 및 수료 대상자 마스터 리스트</p>
                    </div>
                    <form action={signOut}>
                        <Button variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl gap-2 font-bold px-6 h-12 transition-all border border-slate-100 bg-white shadow-sm">
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </Button>
                    </form>
                </div>

                <CrewManagementClient 
                    initialMembers={crewMembers as any || []} 
                    batches={batches}
                />
            </div>
        </div>
    );
}
