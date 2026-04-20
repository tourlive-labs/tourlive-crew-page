"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ChallengeMuseum = {
    name: string;
    emoji: string;
    keywords: string[];
};

export type CafeTier = {
    days: number;
    reward: string;
};

export type ChallengeConfig = {
    id: string;
    month: string;
    badge_label: string;
    is_active: boolean;
    blog_title: string;
    blog_subtitle: string;
    blog_condition: string;
    blog_museums: ChallengeMuseum[];
    cafe_date_range: string;
    cafe_subtitle: string;
    cafe_tiers: CafeTier[];
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

export async function getActiveChallengeConfig(): Promise<ChallengeConfig | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('challenge_configs')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
    return data ?? null;
}

export async function getAllChallengeConfigs(): Promise<ChallengeConfig[] | { error: string }> {
    try {
        const supabase = await assertAdmin();
        const { data, error } = await supabase
            .from('challenge_configs')
            .select('*')
            .order('month', { ascending: false });
        if (error) return { error: error.message };
        return data ?? [];
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function upsertChallengeConfig(config: {
    id?: string;
    month: string;
    badge_label: string;
    is_active: boolean;
    blog_title: string;
    blog_subtitle: string;
    blog_condition: string;
    blog_museums: ChallengeMuseum[];
    cafe_date_range: string;
    cafe_subtitle: string;
    cafe_tiers: CafeTier[];
}): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        const { id, ...fields } = config;
        if (id) {
            const { error } = await supabase
                .from('challenge_configs')
                .update(fields)
                .eq('id', id);
            if (error) return { error: error.message };
        } else {
            const { error } = await supabase
                .from('challenge_configs')
                .insert(fields);
            if (error) return { error: error.message };
        }
        revalidatePath('/dashboard/challenge');
        revalidatePath('/admin/challenge');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function setActiveConfig(id: string): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        // Deactivate all first, then activate the selected one
        await supabase.from('challenge_configs').update({ is_active: false }).not('id', 'is', null);
        const { error } = await supabase
            .from('challenge_configs')
            .update({ is_active: true })
            .eq('id', id);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/challenge');
        revalidatePath('/admin/challenge');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function deleteChallengeConfig(id: string): Promise<{ error?: string }> {
    try {
        const supabase = await assertAdmin();
        const { error } = await supabase.from('challenge_configs').delete().eq('id', id);
        if (error) return { error: error.message };
        revalidatePath('/dashboard/challenge');
        revalidatePath('/admin/challenge');
        return {};
    } catch (err) {
        return { error: (err as Error).message };
    }
}
