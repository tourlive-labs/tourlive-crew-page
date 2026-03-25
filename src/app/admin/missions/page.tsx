"use client";

import { useState, useEffect } from "react";
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    getPendingEssentialMissions, 
    getPendingSideMissions, 
    getAdminLeaderboard,
    updateEssentialStatus,
    updateSideStatus 
} from "@/app/actions/admin";
import { toast } from "sonner";
import { ExternalLink, Download, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminMissionsPage() {
    const [essentialMissions, setEssentialMissions] = useState<any[]>([]);
    const [sideMissions, setSideMissions] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [rejectingItem, setRejectingItem] = useState<{ id: string, type: 'essential' | 'side' } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState<string>("all");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [ess, side, lb] = await Promise.all([
            getPendingEssentialMissions(),
            getPendingSideMissions(),
            getAdminLeaderboard()
        ]);
        setEssentialMissions(ess.data || []);
        setSideMissions(side.data || []);
        setLeaderboard(lb.data || []);
        setLoading(false);
    }

    const handleApprove = async (id: string, type: 'essential' | 'side') => {
        const promise = type === 'essential' 
            ? updateEssentialStatus(id, 'completed') 
            : updateSideStatus(id, 'APPROVED');
            
        toast.promise(promise, {
            loading: '승인 처리 중...',
            success: () => {
                loadData();
                return '승인이 완료되었습니다.';
            },
            error: '승인 처리 실패'
        });
    };

    const handleReject = async () => {
        if (!rejectingItem || !rejectReason.trim()) return;
        setIsRejecting(true);
        
        const promise = rejectingItem.type === 'essential'
            ? updateEssentialStatus(rejectingItem.id, 'REJECTED', rejectReason)
            : updateSideStatus(rejectingItem.id, 'REJECTED', rejectReason);
            
        const res = await promise;
        if (res.success) {
            toast.success("반려 처리가 완료되었습니다.");
            setRejectingItem(null);
            setRejectReason("");
            loadData();
        } else {
            toast.error("반려 처리 실패: " + res.error);
        }
        setIsRejecting(false);
    };

    const exportToCSV = () => {
        if (leaderboard.length === 0) return;
        
        const headers = ["이름", "이메일", "팀", "총 포인트"];
        const rows = leaderboard.map(p => [
            p.nickname,
            p.tourlive_email,
            p.selected_activity === 'naver_blog' ? '블로그' : '카페',
            p.totalPoints
        ]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");
        
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Supporters_Settlement_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatSurvey = (data: any) => {
        if (!data) return "-";
        try {
            const s = typeof data === 'string' ? JSON.parse(data) : data;
            return `[${s.tour_name || 'N/A'}] ⭐${s.rating || 0}/10 | 아쉬움: ${Array.isArray(s.pain_points) ? s.pain_points.join(', ') : (s.pain_points || '없음')}`;
        } catch (e) {
            return "형식 오류";
        }
    };

    const renderLinks = (urlStr: string) => {
        if (!urlStr) return "-";
        const links = urlStr.split(',').filter(l => l.trim());
        return (
            <div className="flex flex-wrap gap-1">
                {links.map((link, idx) => (
                    <Button key={idx} variant="outline" size="xs" className="h-6 px-1.5 text-[10px]" asChild>
                        <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">
                            Link {idx + 1}
                        </a>
                    </Button>
                ))}
            </div>
        );
    };

    const filteredEssential = essentialMissions.filter(m => {
        const matchesSearch = m.profiles?.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             m.profiles?.tourlive_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTeam = selectedTeam === "all" || m.profiles?.selected_activity === selectedTeam;
        return matchesSearch && matchesTeam;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Admin Mission Control</h1>
                        <p className="text-slate-500 font-medium">관리자 전용 미션 승인 및 포인트 정산 시스템</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="사용자 검색..." 
                                className="pl-9 w-64 h-10 bg-white border-slate-200 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="h-10 px-4 bg-white border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                            <option value="all">전체 팀</option>
                            <option value="naver_blog">블로그 팀</option>
                            <option value="naver_cafe">카페 팀</option>
                        </select>
                    </div>
                </div>

                <Tabs defaultValue="essential" className="w-full">
                    <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl h-14 mb-6">
                        <TabsTrigger value="essential" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF5C00] h-full px-8">
                            필수 미션 승인 대기 ({essentialMissions.length})
                        </TabsTrigger>
                        <TabsTrigger value="side" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF5C00] h-full px-8">
                            추가 미션 검증 ({sideMissions.length})
                        </TabsTrigger>
                        <TabsTrigger value="leaderboard" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF5C00] h-full px-8">
                            포인트 현황 및 정산
                        </TabsTrigger>
                    </TabsList>

                    {/* Essential Missions Tab */}
                    <TabsContent value="essential">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="w-[50px]"><Checkbox /></TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">User / Team</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Mission Links</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Cafe Reports</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Survey Summary</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-40 font-bold text-slate-300">데이터 로딩 중...</TableCell></TableRow>
                                    ) : filteredEssential.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-40 font-bold text-slate-300">대기 중인 필수 미션이 없습니다.</TableCell></TableRow>
                                    ) : filteredEssential.map((m) => (
                                        <TableRow key={m.id} className="group hover:bg-slate-50/50 border-slate-50">
                                            <TableCell><Checkbox /></TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-slate-800">{m.profiles?.nickname}</span>
                                                    <Badge className={m.profiles?.selected_activity === 'naver_blog' ? "bg-blue-50 text-blue-600 text-[9px] w-fit px-1.5 border-none mt-1" : "bg-orange-50 text-orange-600 text-[9px] w-fit px-1.5 border-none mt-1"}>
                                                        {m.profiles?.selected_activity === 'naver_blog' ? 'BLOG' : 'CAFE'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{renderLinks(m.post_url)}</TableCell>
                                            <TableCell>
                                                {m.profiles?.selected_activity === 'naver_cafe' ? (
                                                    <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                                        Posts: <span className="text-slate-800">{m.cafe_post_count}</span> | Comments: <span className="text-slate-800">{m.cafe_comment_count}</span>
                                                    </div>
                                                ) : <span className="text-slate-300 text-xs">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[300px] truncate text-[11px] font-medium text-slate-600" title={formatSurvey(m.survey_data)}>
                                                    {formatSurvey(m.survey_data)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold border-green-100 text-green-600 hover:bg-green-50" onClick={() => handleApprove(m.id, 'essential')}>
                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 승인
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold border-red-100 text-red-600 hover:bg-red-50" onClick={() => setRejectingItem({ id: m.id, type: 'essential' })}>
                                                        <XCircle className="w-3.5 h-3.5 mr-1" /> 반려
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Side Missions Tab */}
                    <TabsContent value="side">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Mission Type</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">User</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Proof</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Date</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sideMissions.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-40 font-bold text-slate-300">대기 중인 추가 미션이 없습니다.</TableCell></TableRow>
                                    ) : sideMissions.map((sm) => (
                                        <TableRow key={sm.id} className="hover:bg-slate-50/50 border-slate-50">
                                            <TableCell>
                                                <Badge variant="outline" className="font-black text-[10px] rounded-lg border-indigo-100 text-indigo-600 bg-indigo-50/50">
                                                    {sm.mission_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-black text-sm text-slate-800">{sm.profiles?.nickname}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" className="h-7 text-indigo-500 font-bold text-xs" asChild>
                                                    <a href={sm.proof_url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> View Proof
                                                    </a>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-[10px] font-bold text-slate-400">{new Date(sm.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold border-green-100 text-green-600 hover:bg-green-50" onClick={() => handleApprove(sm.id, 'side')}>
                                                        포인트 확정
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-red-500" onClick={() => setRejectingItem({ id: sm.id, type: 'side' })}>
                                                        반려
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Leaderboard Tab */}
                    <TabsContent value="leaderboard">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <span className="font-black text-slate-800">전체 누적 포인트 현황</span>
                                <Button className="bg-[#FF5C00] hover:bg-[#E65200] text-white font-black rounded-xl" onClick={exportToCSV}>
                                    <Download className="w-4 h-4 mr-2" /> 정산용 CSV 내보내기
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30 border-slate-100">
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">Rank</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight">User / Team</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-tight text-right">Total Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboard.map((p, idx) => (
                                        <TableRow key={p.id} className="hover:bg-slate-50/50 border-slate-50">
                                            <TableCell className="font-black text-slate-400 px-6">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-slate-800">{p.nickname}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{p.tourlive_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-base font-black text-[#FF5C00] px-6">
                                                {p.totalPoints.toLocaleString()} P
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Rejection Modal */}
            <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900">미션 반려 사유 입력</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <Label className="font-black text-slate-600 text-sm">사용자에게 전달할 반려 사유를 입력해주세요.</Label>
                        <Textarea 
                            placeholder="예: UTM 가이드 태그가 누락되었습니다. 수정 후 다시 제출해주세요."
                            className="min-h-[120px] rounded-2xl border-slate-100 focus:border-[#FF5C00] focus:ring-[#FF5C00] transition-all p-4 font-medium"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                            * 반려 사유는 사용자의 대시보드에 즉시 노출되며, 사용자는 이를 확인하고 링크나 내용을 수정하여 다시 제출할 수 있습니다.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="rounded-xl font-bold text-slate-400" onClick={() => setRejectingItem(null)}>취소</Button>
                        <Button 
                            className="bg-red-500 hover:bg-red-600 text-white font-black rounded-xl px-8"
                            onClick={handleReject}
                            disabled={isRejecting || !rejectReason.trim()}
                        >
                            {isRejecting ? '처리 중...' : '최종 반려 처리'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
