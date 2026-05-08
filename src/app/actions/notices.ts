"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Notice = {
    id: string;
    title: string;
    content: string | null;
    category: string | null;
    is_published: boolean;
    image_urls: string[];
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
            .select('id, title, content, category, is_published, image_urls, created_at, updated_at')
            .order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return (data ?? []).map(n => ({ ...n, image_urls: n.image_urls ?? [] }));
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function createNotice(formData: FormData): Promise<{ error?: string; notice?: Notice }> {
    try {
        const supabase = await assertAdmin();

        const title = (formData.get('title') as string ?? '').trim();
        const content = (formData.get('content') as string ?? '').trim();
        const category = (formData.get('category') as string ?? '').trim();
        const is_published = formData.get('is_published') === 'true';
        const image_urls = (formData.getAll('newImageUrl') as string[]).filter(Boolean);

        const { data, error } = await supabase
            .from('notices')
            .insert({ title, content: content || null, category: category || null, is_published, image_urls })
            .select('id, title, content, category, is_published, image_urls, created_at, updated_at')
            .single();

        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return { notice: { ...data, image_urls: data.image_urls ?? [] } };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function updateNotice(id: string, formData: FormData): Promise<{ error?: string; notice?: Notice }> {
    try {
        const supabase = await assertAdmin();

        const title = (formData.get('title') as string ?? '').trim();
        const content = (formData.get('content') as string ?? '').trim();
        const category = (formData.get('category') as string ?? '').trim();
        const is_published = formData.get('is_published') === 'true';
        const existingUrls = (formData.getAll('existingImageUrl') as string[]).filter(Boolean);
        const newImageUrls = (formData.getAll('newImageUrl') as string[]).filter(Boolean);
        const image_urls = [...existingUrls, ...newImageUrls];

        const { data, error } = await supabase
            .from('notices')
            .update({ title, content: content || null, category: category || null, is_published, image_urls })
            .eq('id', id)
            .select('id, title, content, category, is_published, image_urls, created_at, updated_at')
            .single();

        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return { notice: { ...data, image_urls: data.image_urls ?? [] } };
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
