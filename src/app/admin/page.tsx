import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Trophy, LogOut } from "lucide-react";
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

    // Get unique batches for the filter
    const batches = Array.from(new Set(crewMembers?.map(m => m.batch).filter(Boolean))) as string[];

    return (
        <div className="min-h-screen bg-[#FDFCF9] p-8 font-sans antialiased text-slate-900 border-t-[12px] border-orange-500">
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
