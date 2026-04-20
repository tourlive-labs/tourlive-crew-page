"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Notice = {
    id: string;
    title: string;
    content: string | null;
    category: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

async function assertAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
    const isAdmin = profile?.role === 'admin' || user.email === "root@tourlive.co.kr";
    if (!isAdmin) throw new Error("Forbidden");
    return supabase;
}

export async function getNotices(): Promise<Notice[] | { error: string }> {
    try {
        const supabase = await assertAdmin();
        const { data, error } = await supabase
            .from('notices')
            .select('id, title, content, category, is_published, created_at, updated_at')
            .order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return data ?? [];
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function createNotice(input: {
    title: string;
    content: string;
    category: string;
    is_published: boolean;
}): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        const { error } = await supabase.from('notices').insert({
            title: input.title.trim(),
            content: input.content.trim() || null,
            category: input.category.trim() || null,
            is_published: input.is_published,
        });
        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function updateNotice(id: string, input: {
    title: string;
    content: string;
    category: string;
    is_published: boolean;
}): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        const { error } = await supabase.from('notices').update({
            title: input.title.trim(),
            content: input.content.trim() || null,
            category: input.category.trim() || null,
            is_published: input.is_published,
        }).eq('id', id);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function deleteNotice(id: string): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        const { error } = await supabase.from('notices').delete().eq('id', id);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function togglePublish(id: string, current: boolean): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        const { error } = await supabase
            .from('notices')
            .update({ is_published: !current })
            .eq('id', id);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}
