"use client";

import { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Smartphone, ExternalLink, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminFilters } from "./AdminFilters";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Mission {
  id: string;
  status: string;
  points_granted: boolean;
  mission_month: string;
  post_url: string;
}

interface CrewMember {
  id: string;
  full_name: string;
  tourlive_email: string;
  contact_email: string;
  selected_activity: string;
  nickname: string;
  naver_id: string;
  batch?: string;
  created_at: string;
  missions: Mission[];
}

interface CrewManagementClientProps {
  initialMembers: CrewMember[];
  batches: string[];
}

export function CrewManagementClient({ initialMembers, batches }: CrewManagementClientProps) {
  const [batchFilter, setBatchFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [showGraduationOnly, setShowGraduationOnly] = useState(false);

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((m) => {
      const matchBatch = batchFilter === "all" || m.batch === batchFilter;
      const matchField = fieldFilter === "all" || m.selected_activity === fieldFilter;
      
      // Graduation Logic: 3 consecutive months (Feb, Mar, Apr)
      const hasFeb = m.missions?.some(ms => ms.mission_month === '2026-02' && ms.status === 'completed');
      const hasMar = m.missions?.some(ms => ms.mission_month === '2026-03' && ms.status === 'completed');
      const hasApr = m.missions?.some(ms => ms.mission_month === '2026-04' && ms.status === 'completed');
      const isGraduationCandidate = !!(hasFeb && hasMar && hasApr);

      const matchGraduation = !showGraduationOnly || isGraduationCandidate;

      return matchBatch && matchField && matchGraduation;
    });
  }, [initialMembers, batchFilter, fieldFilter, showGraduationOnly]);

  return (
    <div className="space-y-6">
      <AdminFilters 
        batch={batchFilter}
        field={fieldFilter}
        showGraduationOnly={showGraduationOnly}
        onBatchChange={setBatchFilter}
        onFieldChange={setFieldFilter}
        onGraduationToggle={setShowGraduationOnly}
        batches={batches}
      />

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <User className="w-5 h-5 text-orange-500" />
            </div>
            크루 명단
          </CardTitle>
          <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-fit bg-white px-4 py-2 rounded-xl border-slate-100 text-slate-500 font-black shadow-sm text-xs">
                전체 <span className="text-orange-500 ml-1">{filteredMembers.length}</span>명
              </Badge>
              <Link href="/admin/missions">
                  <Button className="bg-slate-900 hover:bg-black text-white font-black rounded-xl px-4 h-10 shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-orange-400" />
                      미션/포인트 정산 바로가기
                  </Button>
              </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-8 py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest">크루 프로필</TableHead>
                  <TableHead className="px-6 py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest">소속 및 분야</TableHead>
                  <TableHead className="px-6 py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest">수료 상태</TableHead>
                  <TableHead className="px-6 py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest">연락처 및 링크</TableHead>
                  <TableHead className="px-8 py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest text-right">등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const hasMar = member.missions?.some(ms => ms.mission_month === '2026-03' && ms.status === 'completed');
                    const hasApr = member.missions?.some(ms => ms.mission_month === '2026-04' && ms.status === 'completed');
                    const hasFeb = member.missions?.some(ms => ms.mission_month === '2026-02' && ms.status === 'completed');
                    const isGraduationCandidate = !!(hasFeb && hasMar && hasApr);

                    return (
                      <TableRow key={member.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-50 group">
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-slate-800 text-lg leading-tight">{member.full_name}</span>
                            <span className="text-slate-400 text-sm font-medium">{member.nickname}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex flex-col gap-2">
                            <Badge className="w-fit px-3 py-0.5 rounded-full border-none bg-indigo-50 text-indigo-600 font-black text-[10px]">
                              {member.batch || "미지정"}
                            </Badge>
                            <span className="text-slate-600 text-sm font-bold">
                              {member.selected_activity === 'naver_cafe' ? "지식여행 카페" : "개인 블로그"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex flex-wrap gap-2">
                            {hasMar && (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-1 rounded-lg font-black text-[11px] h-fit">
                                    [3월]
                                </Badge>
                            )}
                            {hasApr && (
                                <Badge className="bg-sky-50 text-sky-600 border-none px-2.5 py-1 rounded-lg font-black text-[11px] h-fit">
                                    [4월]
                                </Badge>
                            )}
                            {isGraduationCandidate && (
                                <Badge className="bg-amber-50 text-amber-600 border-amber-200 px-2.5 py-1 rounded-lg font-black text-[11px] h-fit shadow-sm shadow-amber-100">
                                    👑 [수료대상]
                                </Badge>
                            )}
                            {!hasMar && !hasApr && !isGraduationCandidate && (
                                <span className="text-slate-300 text-xs font-bold italic">미션 수행 중</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-6 font-medium text-slate-600">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-sm font-bold text-slate-700">{member.tourlive_email}</span>
                            </div>
                            {member.naver_id && (
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-xs font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">ID: {member.naver_id}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-slate-400 text-sm tabular-nums text-right font-medium">
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-60 text-center text-slate-300 font-black text-lg">
                      조건에 맞는 크루 멤버가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
