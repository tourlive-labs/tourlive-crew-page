"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, FormValues } from "@/lib/validations/onboarding-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitOnboardingForm } from "@/app/actions/onboarding";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, ChevronRight, User, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CrewOnboardingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeBatch, setActiveBatch] = useState<{ term: number, id: string } | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            tourliveEmail: "",
            contactEmail: "",
            activityType: "",
            nickname: "",
            password: "",
            travelCountry: "",
            travelCity: "",
            hashtag1: "",
            hashtag2: "",
            hashtag3: "",
            bannerImage: undefined,
        },
    });

    const router = useRouter();

    useEffect(() => {
        async function fetchActiveBatch() {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            const { data } = await supabase
                .from('batches')
                .select('id, term')
                .eq('is_active', true)
                .single();

            if (data) setActiveBatch(data);
        }
        fetchActiveBatch();
    }, []);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === "bannerImage" && value instanceof FileList) {
                    formData.append(key, value[0]);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            const result = await submitOnboardingForm(formData);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("회원가입이 완료되었습니다!");
            router.push(`/dashboard?nickname=${encodeURIComponent(result.nickname || "")}`);
        } catch (error) {
            toast.error("회원가입 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 flex items-center justify-center font-sans antialiased text-slate-900">
            <Card className="w-full max-w-6xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-none rounded-[32px] bg-white overflow-hidden p-0">
                {/* Minimal Step Progress Bar */}
                <div className="flex w-full h-1.5 bg-slate-50">
                    <div className={cn("h-full transition-all duration-500 bg-[#FFD6E0]", currentStep === 1 ? "w-1/2" : "w-1/2")} />
                    <div className={cn("h-full transition-all duration-500", currentStep === 2 ? "bg-[#D6E4FF] w-1/2" : "bg-slate-100 w-1/2")} />
                </div>

                <CardHeader className="p-12 pb-6 flex flex-col items-center">
                    <div className="flex gap-4 mb-8">
                        <div className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                            currentStep === 1
                                ? "bg-[#FFF0F3] border-[#FFD6E0] text-[#E63946]"
                                : "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                            Step 1. 기본 정보
                        </div>
                        <div className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                            currentStep === 2
                                ? "bg-[#F0F5FF] border-[#D6E4FF] text-[#0052CC]"
                                : "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                            Step 2. 활동 정보
                        </div>
                    </div>

                    <div className="text-center">
                        <CardTitle className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                            투어라이브 크루 회원가입
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-3 text-lg">
                            {activeBatch ? `${activeBatch.term}기 활동을 위한 멤버 신청을 진행합니다.` : "정보를 입력해주세요."}
                        </CardDescription>
                    </div>

                    {activeBatch && (
                        <div className="mt-8 px-6 py-2 rounded-full bg-slate-50 border border-slate-100">
                            <p className="text-slate-600 text-sm font-bold text-center">
                                현재 <span className="text-orange-600 font-black">[{activeBatch.term}]기</span> 정규 모집이 활성화 상태입니다.
                            </p>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-12 pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Left Column: Section 1 */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">기본 인적사항</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <FormField control={form.control} name="fullName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold ml-1">이름</FormLabel>
                                                <FormControl><Input placeholder="이름을 입력하세요" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-base placeholder:text-slate-300" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold ml-1">휴대폰 번호</FormLabel>
                                                <FormControl><Input placeholder="010-XXXX-XXXX" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="tourliveEmail" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-bold ml-1">투어라이브 계정</FormLabel>
                                                    <FormControl><Input placeholder="계정 이메일" type="email" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-bold ml-1">연락용 이메일</FormLabel>
                                                    <FormControl><Input placeholder="개인 이메일" type="email" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold ml-1">로그인 비밀번호</FormLabel>
                                                <FormControl><Input type="password" placeholder="******" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all" {...field} /></FormControl>
                                                <FormMessage className="text-slate-400 text-xs mt-2 ml-1" />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="activityType" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold ml-1">활동 모집 분야</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all"><SelectValue placeholder="모집 분야를 선택하세요" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-slate-200">
                                                        <SelectItem value="naver_cafe">네이버 '지식여행' 카페 활동</SelectItem>
                                                        <SelectItem value="personal_blog">개인 블로그 활동</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                {/* Right Column: Section 2 */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">활동 브랜딩 정보</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <FormField control={form.control} name="nickname" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-bold ml-1">활동 닉네임</FormLabel>
                                                <FormControl><Input placeholder="활동에 사용할 닉네임" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-slate-800" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <div>
                                            <p className="text-sm font-bold text-slate-700 mb-2 ml-1">활동 예정지 (국가 및 도시)</p>
                                            <div className="flex gap-4">
                                                <FormField control={form.control} name="travelCountry" render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl><Input placeholder="활동 국가" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="travelCity" render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl><Input placeholder="활동 도시" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-700 mb-2 ml-1">브랜딩 해시태그 (최대 3개)</p>
                                            <div className="flex gap-3">
                                                <FormField control={form.control} name="hashtag1" render={({ field }) => (
                                                    <FormItem className="flex-1"><FormControl><Input placeholder="#태그1" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-xs" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="hashtag2" render={({ field }) => (
                                                    <FormItem className="flex-1"><FormControl><Input placeholder="#태그2" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-xs" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="hashtag3" render={({ field }) => (
                                                    <FormItem className="flex-1"><FormControl><Input placeholder="#태그3" className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all text-xs" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-bold ml-1">대표 배너 이미지</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="banner-upload"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setSelectedFile(file);
                                                                setPreviewUrl(URL.createObjectURL(file));
                                                                form.setValue("bannerImage", e.target.files);
                                                                if (currentStep === 1) setCurrentStep(2);
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor="banner-upload"
                                                        className={cn(
                                                            "border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]",
                                                            previewUrl
                                                                ? "border-transparent bg-slate-50 shadow-inner"
                                                                : "border-slate-100 bg-[#F8F9FA] hover:bg-white hover:border-slate-300"
                                                        )}
                                                    >
                                                        {previewUrl ? (
                                                            <div className="relative w-full h-[140px] rounded-2xl overflow-hidden shadow-sm">
                                                                <img
                                                                    src={previewUrl}
                                                                    alt="Banner preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                    <span className="text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">이미지 교체</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                                                                    <Upload className="w-5 h-5 text-slate-400" />
                                                                </div>
                                                                <span className="text-slate-400 text-sm font-medium">활동 배너 사진을 등록하세요</span>
                                                            </div>
                                                        )}
                                                    </Label>
                                                    {previewUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setPreviewUrl(null);
                                                                setSelectedFile(null);
                                                                form.setValue("bannerImage", undefined);
                                                            }}
                                                            className="absolute -top-2 -right-2 p-1.5 bg-white shadow-md border border-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-slate-50 flex flex-col items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto md:min-w-[320px] h-16 text-white text-lg font-bold rounded-2xl shadow-xl shadow-orange-100/50 hover:scale-[1.02] active:scale-[0.98] transition-all bg-[#FF5C00] border-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            신청 정보 전송 중...
                                        </>
                                    ) : (
                                        "투어라이브 크루 회원가입 완료"
                                    )}
                                </Button>
                                <p className="text-slate-400 text-xs text-center leading-relaxed">
                                    가입 완료 시 개인별 활동 대시보드가 생성되며,<br />활동을 위한 가이드 및 미션 확인이 가능합니다.
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
