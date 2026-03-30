"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Hash, Sparkles, User, Mail, Phone, Calendar, ShieldCheck, Trophy, Edit2, Check, X, Loader2, Globe, Link2 } from "lucide-react";
import { getDashboardData, updateProfile } from "@/app/actions/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import CrewBannerGenerator from "@/components/dashboard/CrewBannerGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MyPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);

    const loadProfile = useCallback(async () => {
        const res = await getDashboardData();
        if (!('error' in res)) {
            setData(res);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleEdit = (sectionId: string, initialValues: any) => {
        setEditingSection(sectionId);
        setEditValues(initialValues);
    };

    const handleCancel = () => {
        setEditingSection(null);
        setEditValues({});
    };

    const validatePhone = (phone: string) => /^[0-9-]*$/.test(phone);

    const handleSave = async (sectionId: string) => {
        setIsSaving(true);
        try {
            const updates = { ...editValues };

            // 1. Specific Validations & Formatting
            if (sectionId === 'section2') {
                if (updates.phone_number && !validatePhone(updates.phone_number)) {
                    toast.error("전화번호는 숫자와 하이픈(-)만 가능합니다.");
                    setIsSaving(false);
                    return;
                }
            }

            if (sectionId === 'section4') {
                ['hashtag_1', 'hashtag_2', 'hashtag_3'].forEach(key => {
                    if (updates[key] && !updates[key].startsWith('#')) {
                        updates[key] = `#${updates[key]}`;
                    }
                });
            }

            // 2. Update via Action
            const result = await updateProfile(updates);
            if (result.success) {
                setData((prev: any) => ({ ...prev, ...updates }));
                setEditingSection(null);
                toast.success("프로필 정보가 성공적으로 업데이트되었습니다! ✨");

                // 3. Banner Visual Feedback (Flash)
                if (sectionId === 'section1' || sectionId === 'section4') {
                    setIsFlashing(true);
                    setTimeout(() => setIsFlashing(false), 1000);
                }
            } else {
                toast.error(result.error || "업데이트에 실패했습니다.");
            }
        } catch (error) {
            toast.error("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 space-y-8 animate-pulse">
                <Skeleton className="h-[400px] w-full rounded-[40px]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-10 text-slate-500 font-bold">프로필 정보를 불러올 수 없습니다.</div>;

    const hashtags = [data.hashtag_1, data.hashtag_2, data.hashtag_3]
        .filter(Boolean)
        .map(tag => tag.replace(/^#/, '')); // Pass clean tags to generator which adds # back
    const travelLocation = `${data.travel_country || ""} ${data.travel_city || ""}`.trim() || "국가 미정";

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-16 animate-in fade-in duration-700">
            {/* My Crew Banner Generator Section */}
            <section className={cn(
                "transition-all duration-500 rounded-[40px]",
                isFlashing && "ring-4 ring-orange-400 ring-offset-8 shadow-2xl shadow-orange-200 scale-[1.02]"
            )}>
                <CrewBannerGenerator 
                    nickname={data.nickname}
                    travelLocation={travelLocation}
                    hashtags={hashtags}
                    profileImageUrl={data.banner_image_url}
                    term={data.batch || "14"}
                />
            </section>

            {/* Atomic Edit Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Section 1: Crew Identity */}
                <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                    <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                            <ShieldCheck className="w-6 h-6 text-[#FF5C00]" />
                            크루 활동 정보
                        </CardTitle>
                        {editingSection !== 'section1' && (
                            <Button variant="ghost" onClick={() => handleEdit('section1', { nickname: data.nickname, selected_activity: data.selected_activity })} className="text-[#FF5C00] font-black gap-2 hover:bg-orange-50 rounded-xl">
                                <Edit2 className="w-4 h-4" /> 수정
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batch</label>
                                <span className="font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-xl w-fit">Tourlive crew {data.batch || "14"}기</span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nickname</label>
                                {editingSection === 'section1' ? (
                                    <Input 
                                        value={editValues.nickname || ""} 
                                        onChange={(e) => setEditValues({ ...editValues, nickname: e.target.value })}
                                        className="h-12 rounded-xl border-slate-200 font-bold"
                                    />
                                ) : (
                                    <span className="text-lg font-black text-slate-800 px-1">{data.nickname}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Type</label>
                                <span className="font-black text-[#FF5C00] bg-orange-50 px-4 py-2 rounded-xl w-fit">
                                    {data.selected_activity === 'naver_cafe' ? '네이버 카페' : '네이버 블로그'}
                                </span>
                            </div>
                        </div>

                        {editingSection === 'section1' && (
                            <div className="flex items-center gap-2 pt-4">
                                <Button onClick={() => handleSave('section1')} disabled={isSaving} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Check className="w-4 h-4 mr-2" /> 저장</>}
                                </Button>
                                <Button variant="ghost" onClick={handleCancel} disabled={isSaving} className="h-12 px-6 rounded-xl text-slate-400 font-bold">취소</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 2: Basic Info (Consolidated) */}
                <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                    <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                            <User className="w-6 h-6 text-[#FF5C00]" />
                            기본 회원 정보
                        </CardTitle>
                        {editingSection !== 'section2' && (
                            <Button variant="ghost" onClick={() => handleEdit('section2', { full_name: data.full_name, phone_number: data.phone_number, naver_id: data.naver_id })} className="text-[#FF5C00] font-black gap-2 hover:bg-orange-50 rounded-xl">
                                <Edit2 className="w-4 h-4" /> 수정
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                {editingSection === 'section2' ? (
                                    <Input value={editValues.full_name || ""} onChange={(e) => setEditValues({ ...editValues, full_name: e.target.value })} className="h-12 rounded-xl border-slate-200 font-bold" />
                                ) : (
                                    <span className="font-black text-slate-800 px-1">{data.full_name}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                {editingSection === 'section2' ? (
                                    <Input value={editValues.phone_number || ""} placeholder="010-0000-0000" onChange={(e) => setEditValues({ ...editValues, phone_number: e.target.value })} className="h-12 rounded-xl border-slate-200 font-bold" />
                                ) : (
                                    <span className="font-black text-slate-800 px-1">{data.phone_number}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Account (Read-only)</label>
                                <span className="font-black text-slate-400 px-1 italic">{data.tourlive_email}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email (Read-only)</label>
                                <span className="font-black text-slate-400 px-1 italic">{data.contact_email}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-t border-slate-50 pt-4 mt-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Naver ID (연동용)</label>
                                {editingSection === 'section2' ? (
                                    <Input value={editValues.naver_id || ""} onChange={(e) => setEditValues({ ...editValues, naver_id: e.target.value })} className="h-12 rounded-xl border-slate-200 font-bold" />
                                ) : (
                                    <span className="font-black text-slate-800 px-1">{data.naver_id || "미등록"}</span>
                                )}
                            </div>
                        </div>

                        {editingSection === 'section2' && (
                            <div className="flex items-center gap-2 pt-4">
                                <Button onClick={() => handleSave('section2')} disabled={isSaving} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Check className="w-4 h-4 mr-2" /> 저장</>}
                                </Button>
                                <Button variant="ghost" onClick={handleCancel} disabled={isSaving} className="h-12 px-6 rounded-xl text-slate-400 font-bold">취소</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 4: Banner & Travel Info */}
                <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 lg:col-span-1">
                    <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-800">
                            <Globe className="w-6 h-6 text-[#FF5C00]" />
                            배너 및 여행 정보
                        </CardTitle>
                        {editingSection !== 'section4' && (
                            <Button variant="ghost" onClick={() => handleEdit('section4', { travel_country: data.travel_country, travel_city: data.travel_city, hashtag_1: data.hashtag_1, hashtag_2: data.hashtag_2, hashtag_3: data.hashtag_3 })} className="text-[#FF5C00] font-black gap-2 hover:bg-orange-50 rounded-xl">
                                <Edit2 className="w-4 h-4" /> 수정
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Country</label>
                                {editingSection === 'section4' ? (
                                    <Input value={editValues.travel_country || ""} onChange={(e) => setEditValues({ ...editValues, travel_country: e.target.value })} className="h-12 rounded-xl border-slate-200 font-bold" />
                                ) : (
                                    <span className="font-black text-slate-800 px-1">{data.travel_country || "미정"}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                {editingSection === 'section4' ? (
                                    <Input value={editValues.travel_city || ""} onChange={(e) => setEditValues({ ...editValues, travel_city: e.target.value })} className="h-12 rounded-xl border-slate-200 font-bold" />
                                ) : (
                                    <span className="font-black text-slate-800 px-1">{data.travel_city || "미정"}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Branding Hashtags</label>
                             <div className="grid grid-cols-1 gap-3">
                                 {[1, 2, 3].map(i => {
                                     const key = `hashtag_${i}`;
                                     return (
                                         <div key={key} className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                                 <Hash className="w-4 h-4 text-[#FF5C00]" />
                                             </div>
                                             {editingSection === 'section4' ? (
                                                 <Input value={editValues[key] || ""} placeholder="#해시태그" onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })} className="h-11 rounded-xl border-slate-200 font-bold" />
                                             ) : (
                                                 <span className="font-black text-slate-900">{data[key] || "-"}</span>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                        </div>

                        {editingSection === 'section4' && (
                            <div className="flex items-center gap-2 pt-4">
                                <Button onClick={() => handleSave('section4')} disabled={isSaving} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><Check className="w-4 h-4 mr-2" /> 저장</>}
                                </Button>
                                <Button variant="ghost" onClick={handleCancel} disabled={isSaving} className="h-12 px-6 rounded-xl text-slate-400 font-bold">취소</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activities summary */}
            <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-slate-50/50">
                <CardContent className="p-10 text-center space-y-4">
                    <Trophy className="w-16 h-16 text-[#FFD9C6] mx-auto animate-bounce" />
                    <h4 className="text-xl font-black text-slate-800">Coming Soon: Crew Ranking</h4>
                    <p className="text-sm font-medium text-slate-400 italic">활동 데이터 통계 및 뱃지 시스템이 준비 중입니다. 열정적인 활동을 기대합니다!</p>
                </CardContent>
            </Card>
        </div>
    );
}
