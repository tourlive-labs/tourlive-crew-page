import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, ArrowRight, Bell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";

interface Notice {
    id: string;
    title: string;
    category: string | null;
    created_at: string;
}

function isNew(createdAt: string): boolean {
    return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export default async function NoticePage() {
    const supabase = await createClient();

    const { data: notices, error } = await supabase
        .from('notices')
        .select('id, title, category, created_at')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-12 animate-in fade-in duration-700">
            <PageHeader
                icon={Bell}
                title="공지사항"
                subtitle="투어라이브 크루 활동의 중요한 소식을 확인하세요."
            />

            {error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <p className="text-slate-800 font-bold">공지사항을 불러오지 못했습니다</p>
                    <p className="text-slate-400 text-sm">잠시 후 다시 시도해 주세요.</p>
                </div>
            ) : (
                <>
                    {notices && notices.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {notices.map((notice: Notice) => {
                                const date = new Date(notice.created_at);
                                const month = `${date.getMonth() + 1}월`;
                                const day = String(date.getDate()).padStart(2, '0');

                                return (
                                    <Link key={notice.id} href={`/dashboard/notice/${notice.id}`} className="block group">
                                        <Card className="rounded-brand border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden bg-white">
                                            <CardContent className="p-0">
                                                <div className="flex items-center p-8 gap-8">
                                                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#FFF5F1] group-hover:text-brand-primary transition-colors shrink-0">
                                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{month}</span>
                                                        <span className="text-lg font-black leading-none">{day}</span>
                                                    </div>
                                                    <div className="flex-1 space-y-2 min-w-0">
                                                        <div className="flex items-center gap-3">
                                                            {notice.category && (
                                                                <Badge variant="outline" className="text-[10px] font-black px-3 py-1 rounded-full border-slate-200 text-slate-400 uppercase tracking-widest">
                                                                    {notice.category}
                                                                </Badge>
                                                            )}
                                                            {isNew(notice.created_at) && (
                                                                <Badge className="bg-brand-primary text-white hover:bg-brand-primary text-[10px] font-black px-3 py-1 rounded-full">
                                                                    NEW
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-800 group-hover:text-slate-900 transition-colors tracking-tight truncate">
                                                            {notice.title}
                                                        </h3>
                                                    </div>
                                                    <ArrowRight className="w-6 h-6 text-slate-200 group-hover:text-brand-primary group-hover:translate-x-2 transition-all shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Megaphone className="w-12 h-12 text-slate-200" />
                            <p className="text-slate-400 font-black text-sm">등록된 공지사항이 없습니다.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
