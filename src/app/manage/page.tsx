import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, MapPin, Tag } from "lucide-react";

export default async function ManagePage() {
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
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
                <Card className="max-w-md w-full text-center p-8 rounded-[32px] border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-800">접근 권한 없음</CardTitle>
                        <CardDescription className="mt-2">관리자만 접근 가능한 페이지입니다.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }


    // 2. Fetch all profiles with their crew/batch info
    const { data: crewMembers, error: fetchError } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            tourlive_email,
            contact_email,
            selected_activity,
            nickname,
            travel_country,
            travel_city,
            created_at,
            crews (
                batches (
                    term
                )
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-8 font-sans antialiased text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">크루 멤버 관리</h1>
                        <p className="text-slate-500 font-medium mt-1">등록된 모든 투어라이브 크루 멤버를 한눈에 확인하고 관리하세요.</p>
                    </div>
                    <Badge variant="outline" className="w-fit bg-white px-4 py-1.5 rounded-full border-slate-200 text-slate-600 font-bold shadow-sm">
                        총 {crewMembers?.length || 0}명
                    </Badge>
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
                                        <TableHead className="px-6 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">투어라이브 계정</TableHead>
                                        <TableHead className="px-6 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">활동 예정지</TableHead>
                                        <TableHead className="px-8 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">가입 일자</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {crewMembers && crewMembers.length > 0 ? (
                                        crewMembers.map((member) => (
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
                                                <TableCell className="px-6 py-6 font-medium text-slate-600">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                                                            <span className="text-sm truncate max-w-[180px]">{member.tourlive_email}</span>
                                                        </div>
                                                        <span className="text-slate-400 text-xs ml-5">{member.contact_email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <MapPin className="w-4 h-4 text-slate-300" />
                                                        <span className="text-sm font-medium">{member.travel_country}, {member.travel_city}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 py-6 text-slate-400 text-sm tabular-nums">
                                                    {new Date(member.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
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

