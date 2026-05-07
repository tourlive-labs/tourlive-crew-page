"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Notice = {
    id: string;
    title: string;
    content: string | null;
    category: string | null;
    is_published: boolean;
    image_url: string | null;
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

async function uploadNoticeImage(supabase: Awaited<ReturnType<typeof assertAdmin>>, file: File): Promise<{ url: string } | { error: string }> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('notices').upload(fileName, file);
    if (error) return { error: `이미지 업로드 실패: ${error.message}` };
    const { data } = supabase.storage.from('notices').getPublicUrl(fileName);
    return { url: data.publicUrl };
}

export async function getNotices(): Promise<Notice[] | { error: string }> {
    try {
        const supabase = await assertAdmin();
        const { data, error } = await supabase
            .from('notices')
            .select('id, title, content, category, is_published, image_url, created_at, updated_at')
            .order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return data ?? [];
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
        const imageFile = formData.get('noticeImage') as File | null;

        let image_url: string | null = null;
        if (imageFile && imageFile.size > 0) {
            const result = await uploadNoticeImage(supabase, imageFile);
            if ('error' in result) return { error: result.error };
            image_url = result.url;
        }

        const { data, error } = await supabase
            .from('notices')
            .insert({
                title,
                content: content || null,
                category: category || null,
                is_published,
                image_url,
            })
            .select('id, title, content, category, is_published, image_url, created_at, updated_at')
            .single();

        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return { notice: data };
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
        const imageFile = formData.get('noticeImage') as File | null;
        const removeImage = formData.get('removeImage') === 'true';
        const existingImageUrl = (formData.get('existingImageUrl') as string | null) || null;

        let image_url: string | null = existingImageUrl;

        if (removeImage) {
            image_url = null;
        } else if (imageFile && imageFile.size > 0) {
            const result = await uploadNoticeImage(supabase, imageFile);
            if ('error' in result) return { error: result.error };
            image_url = result.url;
        }

        const { data, error } = await supabase
            .from('notices')
            .update({
                title,
                content: content || null,
                category: category || null,
                is_published,
                image_url,
            })
            .eq('id', id)
            .select('id, title, content, category, is_published, image_url, created_at, updated_at')
            .single();

        if (error) return { error: error.message };
        revalidatePath('/dashboard/notice');
        revalidatePath('/admin/notices');
        return { notice: data };
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
