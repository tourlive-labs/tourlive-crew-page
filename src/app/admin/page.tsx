import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, MapPin, Tag, Smartphone, ExternalLink, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkPaidButton } from "@/components/MarkPaidButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
    const supabase = await createClient();

    // 1. Check auth and role
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // 2. Fetch role from profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('tourlive_email', user.email)
        .maybeSingle();

    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr";

    if (!isAdmin) {
        redirect("/dashboard");
    }


    // 2. Fetch all profiles with their crew/batch info
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
            travel_country,
            travel_city,
            created_at,
            crews (
                batches (
                    term
                )
            ),
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

    return (
        <div className="min-h-screen bg-[#F9F8F3] p-8 font-sans antialiased text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">크루 멤버 관리</h1>
                        <p className="text-slate-500 font-medium mt-1">등록된 모든 투어라이브 크루 멤버를 한눈에 확인하고 관리하세요.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-fit bg-white px-4 py-1.5 rounded-full border-slate-200 text-slate-600 font-bold shadow-sm">
                            총 {crewMembers?.length || 0}명
                        </Badge>
                        <Link href="/admin/missions">
                            <Button className="bg-[#FF5C00] hover:bg-[#E63900] text-white font-black rounded-xl px-6 h-10 shadow-lg shadow-orange-100/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                                <Trophy className="w-4 h-4" />
                                월간 미션/포인트 정산 바로가기
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-orange-500" />
                            전체 크루 명단
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="px-8 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">이름 / 닉네임</TableHead>
                                        <TableHead className="px-6 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">기수 / 분야</TableHead>
                                        <TableHead className="px-6 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">미션 현황 ({now.getMonth() + 1}월)</TableHead>
                                        <TableHead className="px-6 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">계정 정보</TableHead>
                                        <TableHead className="px-8 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">가입 일자</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {crewMembers && crewMembers.length > 0 ? (
                                        crewMembers.map((member) => {
                                            const currentMission = member.missions?.find(m => m.mission_month === currentMonth);
                                            const status = currentMission?.status || 'none';
                                            const statusText = status === 'checking' ? '작성 중' : 
                                                              status === 'PENDING_APPROVAL' ? '심사 대기' :
                                                              status === 'completed' ? '완료' : 
                                                              status === 'rejected' ? '반려' : '미제출';
                                            
                                            return (
                                                <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                                                    <TableCell className="px-8 py-6">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-800 text-base">{member.full_name}</span>
                                                            <span className="text-slate-400 text-sm">{member.nickname}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <Badge variant="secondary" className="w-fit px-2 py-0 border-none bg-orange-50 text-orange-600 font-bold text-[10px]">
                                                                {(member.crews as any)?.batches?.term}기
                                                            </Badge>
                                                            <span className="text-slate-600 text-sm font-medium">
                                                                {member.selected_activity === 'naver_cafe' ? "지식여행 카페" : "개인 블로그"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-6">
                                                        <div className="flex flex-col gap-2">
                                                            <Badge className={cn(
                                                                "w-fit px-2 py-0.5 rounded-md font-bold text-[10px]",
                                                                status === 'checking' ? "bg-slate-100 text-slate-600" :
                                                                status === 'PENDING_APPROVAL' ? "bg-purple-100 text-purple-600" :
                                                                status === 'completed' ? "bg-blue-100 text-blue-600" :
                                                                status === 'rejected' ? "bg-red-100 text-red-600" :
                                                                "bg-slate-100 text-slate-400"
                                                            )}>
                                                                {statusText}
                                                            </Badge>
                                                            
                                                            {currentMission?.post_url && (
                                                                <div className="flex flex-col gap-1 mt-0.5">
                                                                    {currentMission.post_url.split(',').map((url: string, idx: number) => (
                                                                        <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                                                                            <ExternalLink className="w-3 h-3" />
                                                                            링크 {idx + 1}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {(status === 'completed' || status === 'PENDING_APPROVAL') && currentMission && (
                                                                <MarkPaidButton missionId={currentMission.id} isPaid={currentMission.points_granted} />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-6 font-medium text-slate-600">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <Mail className="w-3.5 h-3.5 text-slate-300" />
                                                                <span className="text-sm truncate max-w-[180px]">{member.tourlive_email}</span>
                                                            </div>
                                                            {member.naver_id && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Smartphone className="w-3.5 h-3.5 text-[#FF5C00]" />
                                                                    <span className="text-xs font-bold text-[#FF5C00]">N: {member.naver_id}</span>
                                                                </div>
                                                            )}
                                                            <span className="text-slate-400 text-[10px] ml-5">{member.contact_email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6 text-slate-400 text-sm tabular-nums">
                                                        {new Date(member.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium">
                                                등록된 크루 멤버가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


