"use client";

import { useState, useTransition } from "react";
import {
    type ChallengeConfig, type ChallengeMuseum, type CafeTier,
    upsertChallengeConfig, setActiveConfig, deleteChallengeConfig,
} from "@/app/actions/challenge-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type FormState = {
    month: string;
    badge_label: string;
    blog_title: string;
    blog_subtitle: string;
    blog_condition: string;
    // Each museum's keywords stored as newline-separated text for editing
    museums: { name: string; emoji: string; keywordsText: string }[];
    cafe_date_range: string;
    cafe_subtitle: string;
    tiers: { days: string; reward: string }[];
};

const MUSEUM_SLOT_LABELS = ["슬롯 1 (황색)", "슬롯 2 (장밋빛)", "슬롯 3 (에메랄드)"];
const MUSEUM_SLOT_COLORS = ["border-amber-300 bg-amber-50", "border-rose-300 bg-rose-50", "border-emerald-300 bg-emerald-50"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function configToForm(config: ChallengeConfig): FormState {
    return {
        month: config.month,
        badge_label: config.badge_label,
        blog_title: config.blog_title,
        blog_subtitle: config.blog_subtitle,
        blog_condition: config.blog_condition,
        museums: config.blog_museums.slice(0, 3).map(m => ({
            name: m.name,
            emoji: m.emoji,
            keywordsText: m.keywords.join("\n"),
        })),
        cafe_date_range: config.cafe_date_range,
        cafe_subtitle: config.cafe_subtitle,
        tiers: config.cafe_tiers.slice(0, 3).map(t => ({
            days: String(t.days),
            reward: t.reward,
        })),
    };
}

function emptyForm(): FormState {
    return {
        month: "",
        badge_label: "",
        blog_title: "",
        blog_subtitle: "",
        blog_condition: "",
        museums: [
            { name: "", emoji: "", keywordsText: "" },
            { name: "", emoji: "", keywordsText: "" },
            { name: "", emoji: "", keywordsText: "" },
        ],
        cafe_date_range: "",
        cafe_subtitle: "매일 게시글 1 + 댓글 5",
        tiers: [
            { days: "10", reward: "1만원권" },
            { days: "20", reward: "3만원권" },
            { days: "30", reward: "5만원권" },
        ],
    };
}

function formToConfig(form: FormState): Omit<ChallengeConfig, "id" | "is_active" | "created_at" | "updated_at"> {
    const blog_museums: ChallengeMuseum[] = form.museums
        .filter(m => m.name.trim())
        .map(m => ({
            name: m.name.trim(),
            emoji: m.emoji.trim(),
            keywords: m.keywordsText
                .split("\n")
                .map(k => k.trim())
                .filter(Boolean),
        }));

    const cafe_tiers: CafeTier[] = form.tiers
        .filter(t => t.days && t.reward.trim())
        .map(t => ({
            days: parseInt(t.days, 10),
            reward: t.reward.trim(),
        }));

    return {
        month: form.month.trim(),
        badge_label: form.badge_label.trim(),
        blog_title: form.blog_title.trim(),
        blog_subtitle: form.blog_subtitle.trim(),
        blog_condition: form.blog_condition.trim(),
        blog_museums,
        cafe_date_range: form.cafe_date_range.trim(),
        cafe_subtitle: form.cafe_subtitle.trim(),
        cafe_tiers,
    };
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteConfirmDialog({
    open,
    month,
    onClose,
    onConfirm,
}: {
    open: boolean;
    month: string;
    onClose: () => void;
    onConfirm: () => Promise<string | undefined>;
}) {
    const [isPending, startTransition] = useTransition();
    const handleConfirm = () => {
        startTransition(async () => {
            const err = await onConfirm();
            if (err) { toast.error(err); return; }
            onClose();
            toast.success("구성이 삭제되었습니다.");
        });
    };
    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-black text-slate-900">구성 삭제</DialogTitle>
                </DialogHeader>
                <p className="text-sm font-medium text-slate-600 py-2">
                    <span className="font-black text-slate-900">{month}</span> 챌린지 구성을 삭제합니다.<br />
                    삭제 후 복구할 수 없습니다.
                </p>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="font-bold rounded-xl">취소</Button>
                    <Button onClick={handleConfirm} disabled={isPending}
                        className="bg-red-500 hover:bg-red-600 text-white font-black rounded-xl">
                        {isPending ? "삭제 중..." : "삭제"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

function ConfigForm({
    form,
    onChange,
}: {
    form: FormState;
    onChange: (next: FormState) => void;
}) {
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        onChange({ ...form, [key]: value });

    const setMuseum = (idx: number, field: keyof FormState["museums"][0], value: string) => {
        const museums = form.museums.map((m, i) => i === idx ? { ...m, [field]: value } : m);
        onChange({ ...form, museums });
    };

    const setTier = (idx: number, field: keyof FormState["tiers"][0], value: string) => {
        const tiers = form.tiers.map((t, i) => i === idx ? { ...t, [field]: value } : t);
        onChange({ ...form, tiers });
    };

    return (
        <div className="space-y-8">

            {/* Meta */}
            <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500">월 (YYYY-MM) *</Label>
                        <Input
                            value={form.month}
                            onChange={e => set("month", e.target.value)}
                            placeholder="2026-05"
                            className="h-10 rounded-xl border-slate-200 font-mono"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500">배지 레이블 *</Label>
                        <Input
                            value={form.badge_label}
                            onChange={e => set("badge_label", e.target.value)}
                            placeholder="May 2026"
                            className="h-10 rounded-xl border-slate-200 font-bold"
                        />
                    </div>
                </div>
            </section>

            {/* Blog */}
            <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">블로그 챌린지</h3>

                <div className="space-y-1.5">
                    <Label className="text-xs font-black text-slate-500">제목</Label>
                    <Input
                        value={form.blog_title}
                        onChange={e => set("blog_title", e.target.value)}
                        placeholder="파리 미술관 여행 포스팅 챌린지"
                        className="h-10 rounded-xl border-slate-200 font-bold"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-black text-slate-500">부제</Label>
                    <Input
                        value={form.blog_subtitle}
                        onChange={e => set("blog_subtitle", e.target.value)}
                        placeholder="4월 미션 콘텐츠에 파리 3대 미술관 중 1개 포스팅"
                        className="h-10 rounded-xl border-slate-200 font-bold"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-black text-slate-500">참여 조건</Label>
                    <Textarea
                        value={form.blog_condition}
                        onChange={e => set("blog_condition", e.target.value)}
                        rows={2}
                        className="rounded-xl border-slate-200 font-bold text-sm resize-none"
                    />
                </div>

                {/* Museums */}
                <div className="space-y-3">
                    <Label className="text-xs font-black text-slate-500">미술관 슬롯 (최대 3개)</Label>
                    {form.museums.map((m, idx) => (
                        <div key={idx} className={cn("p-4 rounded-2xl border-2 space-y-3", MUSEUM_SLOT_COLORS[idx])}>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{MUSEUM_SLOT_LABELS[idx]}</p>
                            <div className="flex gap-2">
                                <Input
                                    value={m.emoji}
                                    onChange={e => setMuseum(idx, "emoji", e.target.value)}
                                    placeholder="🏛️"
                                    className="h-9 w-16 rounded-xl border-slate-200 text-center text-lg bg-white"
                                />
                                <Input
                                    value={m.name}
                                    onChange={e => setMuseum(idx, "name", e.target.value)}
                                    placeholder="루브르 박물관"
                                    className="h-9 flex-1 rounded-xl border-slate-200 font-bold bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400">키워드 (한 줄에 하나)</p>
                                <Textarea
                                    value={m.keywordsText}
                                    onChange={e => setMuseum(idx, "keywordsText", e.target.value)}
                                    rows={5}
                                    placeholder={"루브르 박물관 투어\n루브르 박물관 입장권\n..."}
                                    className="rounded-xl border-slate-200 font-mono text-xs resize-y bg-white"
                                />
                                <p className="text-[10px] text-slate-300">
                                    {m.keywordsText.split("\n").filter(k => k.trim()).length}개 키워드
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cafe */}
            <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">카페 챌린지</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500">기간</Label>
                        <Input
                            value={form.cafe_date_range}
                            onChange={e => set("cafe_date_range", e.target.value)}
                            placeholder="4.1 — 4.30"
                            className="h-10 rounded-xl border-slate-200 font-bold"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500">부제</Label>
                        <Input
                            value={form.cafe_subtitle}
                            onChange={e => set("cafe_subtitle", e.target.value)}
                            placeholder="매일 게시글 1 + 댓글 5"
                            className="h-10 rounded-xl border-slate-200 font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-500">티어 리워드 (슬롯 순서 고정)</Label>
                    {form.tiers.map((tier, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <span className="text-[10px] font-black text-slate-400 w-14 shrink-0">
                                {idx === 0 ? "10일" : idx === 1 ? "20일" : "30일"}
                            </span>
                            <Input
                                value={tier.days}
                                onChange={e => setTier(idx, "days", e.target.value)}
                                placeholder="10"
                                type="number"
                                className="h-9 w-20 rounded-xl border-slate-200 font-mono text-center"
                            />
                            <Input
                                value={tier.reward}
                                onChange={e => setTier(idx, "reward", e.target.value)}
                                placeholder="1만원권"
                                className="h-9 flex-1 rounded-xl border-slate-200 font-bold"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export default function ChallengeConfigClient({ initialConfigs }: { initialConfigs: ChallengeConfig[] }) {
    const [configs, setConfigs] = useState<ChallengeConfig[]>(initialConfigs);
    const [selectedId, setSelectedId] = useState<string | "new" | null>(
        initialConfigs.find(c => c.is_active)?.id ?? initialConfigs[0]?.id ?? null
    );
    const [form, setForm] = useState<FormState>(() => {
        const active = initialConfigs.find(c => c.is_active) ?? initialConfigs[0];
        return active ? configToForm(active) : emptyForm();
    });
    const [deleteTarget, setDeleteTarget] = useState<ChallengeConfig | null>(null);
    const [isSaving, startSave] = useTransition();
    const [isActivating, startActivate] = useTransition();

    const selectedConfig = selectedId === "new" ? null : configs.find(c => c.id === selectedId) ?? null;

    const handleSelectConfig = (config: ChallengeConfig) => {
        setSelectedId(config.id);
        setForm(configToForm(config));
    };

    const handleNewConfig = () => {
        setSelectedId("new");
        setForm(emptyForm());
    };

    const handleSave = () => {
        if (!form.month) { toast.error("월을 입력해 주세요. (예: 2026-05)"); return; }
        if (!form.badge_label) { toast.error("배지 레이블을 입력해 주세요."); return; }

        startSave(async () => {
            const payload = formToConfig(form);
            const res = await upsertChallengeConfig({
                ...payload,
                id: selectedConfig?.id,
                is_active: selectedConfig?.is_active ?? false,
            });
            if (res.error) { toast.error(res.error); return; }

            if (selectedId === "new") {
                // Refresh — we don't have the new ID, so just show success
                toast.success("새 구성이 저장되었습니다. 페이지를 새로고침하면 목록에 나타납니다.");
            } else {
                // Update local state
                setConfigs(prev => prev.map(c =>
                    c.id === selectedConfig!.id
                        ? { ...c, ...payload, updated_at: new Date().toISOString() }
                        : c
                ));
                toast.success("저장되었습니다.");
            }
        });
    };

    const handleActivate = () => {
        if (!selectedConfig) { toast.error("먼저 저장 후 활성화해 주세요."); return; }
        startActivate(async () => {
            const res = await setActiveConfig(selectedConfig.id);
            if (res.error) { toast.error(res.error); return; }
            setConfigs(prev => prev.map(c => ({ ...c, is_active: c.id === selectedConfig.id })));
            toast.success(`${selectedConfig.month} 구성이 활성화되었습니다.`);
        });
    };

    const handleDelete = async (): Promise<string | undefined> => {
        if (!deleteTarget) return;
        const res = await deleteChallengeConfig(deleteTarget.id);
        if (res.error) return res.error;
        const remaining = configs.filter(c => c.id !== deleteTarget.id);
        setConfigs(remaining);
        if (selectedId === deleteTarget.id) {
            const next = remaining[0] ?? null;
            setSelectedId(next?.id ?? null);
            setForm(next ? configToForm(next) : emptyForm());
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

            {/* Left: Config list */}
            <div className="space-y-2">
                <Button
                    onClick={handleNewConfig}
                    variant="outline"
                    className={cn(
                        "w-full justify-start gap-2 rounded-2xl h-11 font-black border-dashed border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50",
                        selectedId === "new" && "border-orange-400 text-orange-500 bg-orange-50"
                    )}
                >
                    <Plus className="w-4 h-4" />
                    새 구성 추가
                </Button>

                {configs.length === 0 ? (
                    <p className="text-xs font-bold text-slate-300 text-center py-8">등록된 구성이 없습니다.</p>
                ) : (
                    configs.map(config => (
                        <button
                            key={config.id}
                            onClick={() => handleSelectConfig(config)}
                            className={cn(
                                "w-full flex items-center justify-between gap-2 p-4 rounded-2xl border text-left transition-all",
                                selectedId === config.id
                                    ? "border-orange-200 bg-orange-50 shadow-sm"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            <div>
                                <p className="text-sm font-black text-slate-800">{config.month}</p>
                                <p className="text-[11px] font-bold text-slate-400">{config.badge_label}</p>
                            </div>
                            {config.is_active && (
                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none font-black text-[10px] px-2 py-0.5 rounded-full shrink-0">
                                    활성
                                </Badge>
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* Right: Edit form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                        <p className="text-sm font-black text-slate-800">
                            {selectedId === "new" ? "새 구성" : selectedConfig?.month ?? "구성 없음"}
                        </p>
                        <p className="text-xs font-bold text-slate-400">
                            {selectedId === "new" ? "새 월별 챌린지 구성을 만듭니다" : `마지막 수정: ${selectedConfig ? new Date(selectedConfig.updated_at).toLocaleDateString('ko-KR') : "—"}`}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {selectedConfig && !selectedConfig.is_active && (
                            <Button
                                onClick={handleActivate}
                                disabled={isActivating}
                                variant="outline"
                                className="gap-1.5 rounded-xl font-black text-xs h-9 px-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                {isActivating ? "활성화 중..." : "활성화"}
                            </Button>
                        )}
                        {selectedConfig && (
                            <Button
                                onClick={() => setDeleteTarget(selectedConfig)}
                                variant="ghost"
                                className="gap-1.5 rounded-xl font-black text-xs h-9 px-3 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="gap-1.5 rounded-xl font-black text-xs h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            {isSaving ? "저장 중..." : "저장"}
                        </Button>
                    </div>
                </div>

                {/* Active status banner */}
                {selectedConfig?.is_active && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <p className="text-xs font-black text-emerald-700">현재 크루 포털에 표시 중인 활성 구성입니다.</p>
                    </div>
                )}

                <ConfigForm form={form} onChange={setForm} />
            </div>

            {/* Delete confirm */}
            {deleteTarget && (
                <DeleteConfirmDialog
                    open={!!deleteTarget}
                    month={deleteTarget.month}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}
