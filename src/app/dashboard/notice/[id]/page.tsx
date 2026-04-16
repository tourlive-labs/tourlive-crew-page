import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-black text-slate-900 mt-8 mb-3 leading-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-black text-slate-800 mt-6 mb-2 leading-tight">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">{children}</h3>,
    p: ({ children }) => <p className="text-slate-600 font-medium leading-relaxed mb-4">{children}</p>,
    strong: ({ children }) => <strong className="font-black text-slate-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-4 text-slate-600 font-medium">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-4 text-slate-600 font-medium">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-bold">
            {children}
        </a>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-brand-primary/30 pl-4 my-4 text-slate-500 italic">
            {children}
        </blockquote>
    ),
    code: ({ children }) => (
        <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-sm font-mono text-slate-700">
            {children}
        </code>
    ),
    hr: () => <hr className="border-slate-200 my-6" />,
};

export default async function NoticeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: notice, error } = await supabase
        .from('notices')
        .select('id, title, content, category, created_at')
        .eq('id', id)
        .single();

    if (error || !notice) {
        notFound();
    }

    const formattedDate = new Date(notice.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-[800px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title={notice.title}
                backHref="/dashboard/notice"
                backLabel="공지사항으로 돌아가기"
            />

            <div className="flex items-center gap-3">
                {notice.category && (
                    <Badge
                        variant="outline"
                        className="text-[10px] font-black px-3 py-1 rounded-full border-slate-200 text-slate-400 uppercase tracking-widest"
                    >
                        {notice.category}
                    </Badge>
                )}
                <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate}
                </span>
            </div>

            <div className="bg-white rounded-brand p-8 shadow-sm border border-slate-100">
                {notice.content ? (
                    <ReactMarkdown components={markdownComponents}>
                        {notice.content}
                    </ReactMarkdown>
                ) : (
                    <p className="text-slate-400 font-medium">내용이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
