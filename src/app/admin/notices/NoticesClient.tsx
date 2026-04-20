"use client";

import { useState, useTransition } from "react";
import { type Notice, createNotice, updateNotice, deleteNotice, togglePublish } from "@/app/actions/notices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["공지", "안내", "이벤트", "업데이트"];

type FormState = {
    title: string;
    content: string;
    category: string;
    is_published: boolean;
};

const defaultForm = (): FormState => ({
    title: "",
    content: "",
    category: "",
    is_published: true,
});

function NoticeFormDialog({
    open,
    onClose,
    initial,
    onSubmit,
    mode,
}: {
    open: boolean;
    onClose: () => void;
    initial: FormState;
    onSubmit: (data: FormState) => Promise<void>;
    mode: "create" | "edit";
}) {
    const [form, setForm] = useState<FormState>(initial);
    const [isPending, startTransition] = useTransition();

    const set = (field: keyof FormState, value: string | boolean) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("제목을 입력해 주세요."); return; }
        startTransition(async () => {
            try {
                await onSubmit(form);
                onClose();
                toast.success(mode === "create" ? "공지가 등록되었습니다." : "공지가 수정되었습니다.");
            } catch (err) {
                toast.error((err as Error).message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-black text-slate-900">
                        {mode === "create" ? "공지 등록" : "공지 수정"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">제목 *</Label>
                        <Input
                            value={form.title}
                            onChange={e => set("title", e.target.value)}
                            placeholder="공지 제목을 입력하세요"
                            className="h-11 rounded-xl border-slate-200 font-bold"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">카테고리</Label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => set("category", form.category === cat ? "" : cat)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-black border transition-all",
                                        form.category === cat
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                            <Input
                                value={CATEGORIES.includes(form.category) ? "" : form.category}
                                onChange={e => set("category", e.target.value)}
                                placeholder="직접 입력"
                                className="h-8 w-28 rounded-full text-xs border-slate-200 font-bold px-3"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            내용 <span className="normal-case font-medium text-slate-300">(Markdown 지원)</span>
                        </Label>
                        <Textarea
                            value={form.content}
                            onChange={e => set("content", e.target.value)}
                            placeholder={`## 제목\n\n내용을 입력하세요.\n\n- 목록 항목\n- **굵게**, *기울임*`}
                            className="min-h-[240px] rounded-xl border-slate-200 font-mono text-sm resize-y"
                        />
                    </div>

                    {/* Publish toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                            <p className="text-sm font-black text-slate-800">공개 여부</p>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">비공개 시 크루에게 보이지 않습니다.</p>
                        </div>
                        <Switch
                            checked={form.is_published}
                            onCheckedChange={v => set("is_published", v)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold rounded-xl">
                            취소
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl px-6"
                        >
                            {isPending ? "저장 중..." : mode === "create" ? "등록하기" : "저장하기"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteConfirmDialog({
    open,
    title,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await onConfirm();
                onClose();
                toast.success("공지가 삭제되었습니다.");
            } catch (err) {
                toast.error((err as Error).message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-black text-slate-900">공지 삭제</DialogTitle>
                </DialogHeader>
                <p className="text-sm font-medium text-slate-600 py-2">
                    <span className="font-black text-slate-900">"{title}"</span>를 삭제합니다.<br />
                    삭제된 공지는 복구할 수 없습니다.
                </p>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="font-bold rounded-xl">취소</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="bg-red-500 hover:bg-red-600 text-white font-black rounded-xl"
                    >
                        {isPending ? "삭제 중..." : "삭제"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function NoticesClient({ initialNotices }: { initialNotices: Notice[] }) {
    const [notices, setNotices] = useState<Notice[]>(initialNotices);
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Notice | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const refresh = async () => {
        // Re-fetch via server action after mutation
        // revalidatePath handles this via the Next.js cache; we just update local state inline
    };

    const handleCreate = async (data: FormState) => {
        await createNotice(data);
        // Optimistically prepend
        const optimistic: Notice = {
            id: crypto.randomUUID(),
            ...data,
            content: data.content || null,
            category: data.category || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setNotices(prev => [optimistic, ...prev]);
    };

    const handleUpdate = async (data: FormState) => {
        if (!editTarget) return;
        await updateNotice(editTarget.id, data);
        setNotices(prev => prev.map(n =>
            n.id === editTarget.id
                ? { ...n, ...data, content: data.content || null, category: data.category || null, updated_at: new Date().toISOString() }
                : n
        ));
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteNotice(deleteTarget.id);
        setNotices(prev => prev.filter(n => n.id !== deleteTarget.id));
    };

    const handleToggle = async (notice: Notice) => {
        setTogglingId(notice.id);
        try {
            await togglePublish(notice.id, notice.is_published);
            setNotices(prev => prev.map(n =>
                n.id === notice.id ? { ...n, is_published: !n.is_published } : n
            ));
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-slate-400 font-bold">총 {notices.length}건 · 공개 {notices.filter(n => n.is_published).length}건</p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl gap-2 h-11 px-5 shadow-lg shadow-orange-100/60"
                >
                    <Plus className="w-4 h-4" />
                    공지 등록
                </Button>
            </div>

            {/* Notice list */}
            {notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-brand-xl border border-slate-100">
                    <Megaphone className="w-10 h-10 text-slate-200" />
                    <p className="text-slate-400 font-black text-sm">등록된 공지가 없습니다.</p>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        variant="outline"
                        className="rounded-xl font-bold border-slate-200"
                    >
                        첫 공지 등록하기
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {notices.map(notice => {
                        const date = new Date(notice.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        });

                        return (
                            <div
                                key={notice.id}
                                className={cn(
                                    "flex items-center gap-4 p-5 bg-white rounded-2xl border transition-all",
                                    notice.is_published ? "border-slate-100" : "border-dashed border-slate-200 opacity-60"
                                )}
                            >
                                {/* Status dot */}
                                <div className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    notice.is_published ? "bg-emerald-400" : "bg-slate-300"
                                )} />

                                {/* Main info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {notice.category && (
                                            <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5 rounded-full border-slate-200 text-slate-400 uppercase tracking-widest">
                                                {notice.category}
                                            </Badge>
                                        )}
                                        {!notice.is_published && (
                                            <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5 rounded-full border-slate-200 text-slate-300">
                                                비공개
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="font-black text-slate-800 truncate">{notice.title}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">{date}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggle(notice)}
                                        disabled={togglingId === notice.id}
                                        className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700"
                                        title={notice.is_published ? "비공개로 전환" : "공개로 전환"}
                                    >
                                        {notice.is_published
                                            ? <Eye className="w-4 h-4" />
                                            : <EyeOff className="w-4 h-4" />
                                        }
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditTarget(notice)}
                                        className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteTarget(notice)}
                                        className="w-9 h-9 rounded-xl text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create modal */}
            <NoticeFormDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                initial={defaultForm()}
                onSubmit={handleCreate}
                mode="create"
            />

            {/* Edit modal */}
            {editTarget && (
                <NoticeFormDialog
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    initial={{
                        title: editTarget.title,
                        content: editTarget.content ?? "",
                        category: editTarget.category ?? "",
                        is_published: editTarget.is_published,
                    }}
                    onSubmit={handleUpdate}
                    mode="edit"
                />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <DeleteConfirmDialog
                    open={!!deleteTarget}
                    title={deleteTarget.title}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </>
    );
}
