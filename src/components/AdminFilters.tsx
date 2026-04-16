"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface AdminFiltersProps {
  batch: string;
  field: string;
  showGraduationOnly: boolean;
  onBatchChange: (value: string) => void;
  onFieldChange: (value: string) => void;
  onGraduationToggle: (value: boolean) => void;
  batches: string[];
}

export function AdminFilters({
  batch,
  field,
  showGraduationOnly,
  onBatchChange,
  onFieldChange,
  onGraduationToggle,
  batches
}: AdminFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 p-6 bg-white rounded-brand shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
      <div className="flex items-center gap-2 text-slate-400">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">필터링</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 flex-1">
        {/* Batch Selector */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">기수 선택</Label>
          <Select value={batch} onValueChange={onBatchChange}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700">
              <SelectValue placeholder="기수 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all">전체 기수</SelectItem>
              {batches.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Field Selector */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">분야 선택</Label>
          <Select value={field} onValueChange={onFieldChange}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700">
              <SelectValue placeholder="분야 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all">전체 분야</SelectItem>
              <SelectItem value="personal_blog">개인 블로그</SelectItem>
              <SelectItem value="naver_cafe">지식여행 카페</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Graduation Toggle */}
        <div className="flex items-center space-x-3 ml-auto bg-orange-50/50 px-4 py-2.5 rounded-2xl border border-orange-100/50">
          <Label htmlFor="graduation-mode" className="text-sm font-black text-orange-600 cursor-pointer">
            🎓 수료대상자만 보기
          </Label>
          <Switch 
            id="graduation-mode" 
            checked={showGraduationOnly} 
            onCheckedChange={onGraduationToggle}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
