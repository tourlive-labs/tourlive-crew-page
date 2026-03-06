"use client";

import { useState } from "react";
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
import { Loader2, Upload, X } from "lucide-react";


export default function CrewOnboardingForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key !== "bannerImage") {
                formData.append(key, value as string);
            }
        });

        if (selectedFile) {
            formData.append("bannerImage", selectedFile);
        }

        try {
            const result = await submitOnboardingForm(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("반갑습니다! 가입이 완료되었습니다.");
                router.push(`/dashboard?nickname=${encodeURIComponent(result.nickname || "")}`);
            }
        } catch (error) {
            toast.error("회원가입 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = [
            "fullName", "phone", "tourliveEmail", "contactEmail", "activityType", "nickname", "password"
        ] as const;

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setStep(2);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50/50 py-10 px-4 flex items-center justify-center">
            <Card className="w-full max-w-lg shadow-[0_8px_30px_rgb(255,133,0,0.08)] border-orange-100 rounded-2xl bg-white overflow-hidden">
                <CardHeader className="text-center sm:text-left border-b border-orange-50 bg-white pb-6 pt-8">
                    <CardTitle className="text-2xl font-bold text-primary tracking-tight">투어라이브 크루 회원가입</CardTitle>
                    <CardDescription className="text-orange-900/60 font-medium mt-2">
                        {step === 1 ? '1/2 단계 - 회원 기본 정보' : '2/2 단계 - 배너 제작 정보'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {step === 1 && (
                                <>
                                    <FormField control={form.control} name="fullName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>이름</FormLabel>
                                            <FormControl><Input placeholder="홍길동" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>휴대폰 번호</FormLabel>
                                            <FormControl><Input placeholder="010-XXXX-XXXX" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="tourliveEmail" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>투어라이브 계정 이메일</FormLabel>
                                            <FormControl><Input placeholder="tourlive@example.com" type="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>비밀번호 (추후 로그인용)</FormLabel>
                                            <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>연락용 이메일</FormLabel>
                                            <FormControl><Input placeholder="personal@example.com" type="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="activityType" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>지원 활동</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="활동 선택" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="naver_cafe">네이버 '지식여행' 카페 활동</SelectItem>
                                                    <SelectItem value="personal_blog">개인 블로그 활동</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="nickname" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>활동 닉네임</FormLabel>
                                            <FormControl><Input placeholder="투어라이브닉" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <Button type="button" onClick={nextStep} className="w-full text-white">다음</Button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <FormField control={form.control} name="nickname" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>활동 닉네임 (자동입력)</FormLabel>
                                            <FormControl><Input disabled {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <p className="text-sm font-medium mt-4">여행 국가 및 도시</p>
                                    <div className="flex gap-4">
                                        <FormField control={form.control} name="travelCountry" render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl><Input placeholder="프랑스" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="travelCity" render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl><Input placeholder="파리" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* Real Image Upload */}
                                    <FormItem>
                                        <FormLabel>배너 이미지 업로드</FormLabel>
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
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor="banner-upload"
                                                    className={`
                                                        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                                                        hover:bg-orange-50 transition-colors flex flex-col items-center justify-center min-h-32
                                                        ${previewUrl ? 'border-transparent p-0' : 'border-primary/50'}
                                                    `}
                                                >
                                                    {previewUrl ? (
                                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                                                            <img
                                                                src={previewUrl}
                                                                alt="Banner preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white text-sm font-medium">이미지 변경</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                                                            <span className="text-gray-600 text-sm font-medium">
                                                                클릭하여 배너 이미지를 업로드하세요.
                                                            </span>
                                                            <p className="text-xs text-gray-400">배너는 본인의 여행을 잘 보여주는 사진이 좋습니다.</p>
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
                                                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>

                                    <p className="text-sm font-medium mt-4">본인 관련 해시태그 3가지</p>
                                    <div className="flex gap-2">
                                        <FormField control={form.control} name="hashtag1" render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="#교환학생" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="hashtag2" render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="#유빙" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="hashtag3" render={({ field }) => (
                                            <FormItem className="flex-1"><FormControl><Input placeholder="#유럽" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <Button type="button" variant="outline" onClick={() => setStep(1)}>이전</Button>
                                        <Button type="submit" disabled={isSubmitting} className="text-white min-w-[100px]">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    제출 중...
                                                </>
                                            ) : (
                                                "가입 완료"
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
