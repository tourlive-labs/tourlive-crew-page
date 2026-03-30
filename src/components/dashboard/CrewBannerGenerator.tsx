"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Sparkles, Plane, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CrewBannerGeneratorProps {
    nickname: string;
    travelLocation: string;
    hashtags: string[];
    profileImageUrl?: string;
    term?: string;
}

export default function CrewBannerGenerator({
    nickname,
    travelLocation,
    hashtags,
    profileImageUrl,
    term = "14"
}: CrewBannerGeneratorProps) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [isFullSize, setIsFullSize] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownload = async () => {
        if (!bannerRef.current) return;
        
        setIsExporting(true);
        try {
            // Use a slight delay to ensure everything is rendered
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const dataUrl = await toPng(bannerRef.current, {
                cacheBust: true,
                width: 1200,
                height: 520,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });
            
            const link = document.createElement('a');
            link.download = `tourlive-crew-banner-${nickname}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("배너 이미지가 다운로드되었습니다! ✨");
        } catch (err) {
            console.error("Banner export failed:", err);
            toast.error("배너 생성 중 오류가 발생했습니다.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#FF5C00]" />
                        나만의 크루 배너 생성기
                    </h3>
                    <p className="text-sm font-medium text-slate-400">네이버 블로그 헤더나 본문에 활용하기 좋은 고화질 배너입니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline"
                        onClick={() => setIsFullSize(!isFullSize)}
                        className="h-12 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        {isFullSize ? "대시보드형 보기" : "원본 크기 보기 (100%)"}
                    </Button>
                    <Button 
                        onClick={handleDownload} 
                        disabled={isExporting}
                        className="h-12 px-8 rounded-2xl bg-[#FF5C00] hover:bg-[#E63900] text-white font-black gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-200"
                    >
                        <Download className={cn("w-4 h-4", isExporting && "animate-bounce")} />
                        {isExporting ? "생성 중..." : "배너 다운로드 (PNG)"}
                    </Button>
                </div>
            </div>

            {/* Banner Preview Area */}
            <div className="relative rounded-[40px] border border-slate-100 shadow-2xl shadow-orange-100/30 group bg-slate-50 p-4 lg:p-12 flex flex-col items-center gap-6 overflow-hidden">
                {/* Scroll Wrapper */}
                <div className="w-full overflow-x-auto pb-4 custom-scrollbar flex justify-center">
                    {/* The actual exportable container - Wrapped for scaling */}
                    <div 
                        className="relative bg-white shadow-xl ring-1 ring-slate-200 rounded-lg shrink-0"
                        style={{ 
                            width: isFullSize ? '1200px' : 'calc(var(--banner-scale) * 1200)', 
                            height: isFullSize ? '520px' : 'calc(var(--banner-scale) * 520)',
                            overflow: 'hidden',
                            transition: 'width 0.3s ease, height 0.3s ease'
                        }}
                    >
                        <div 
                            ref={bannerRef}
                            className="relative w-[1200px] h-[520px] bg-white flex select-none pointer-events-none origin-top-left"
                            style={{ 
                                transform: isFullSize ? 'scale(1)' : 'scale(var(--banner-scale, 0.5))',
                                transition: 'transform 0.3s ease'
                            }}
                        >
                            {/* Top & Bottom Accent Bars */}
                            <div className="absolute top-0 left-0 right-0 h-[24px] bg-[#FF9F00]" />
                            <div className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#FF9F00]" />

                            {/* Slogan Text (Rotated Horizontal Block) */}
                            <div className="absolute left-[30px] bottom-[80px] flex flex-col items-center gap-4 origin-bottom-left" style={{ transform: 'rotate(-90deg) translate(0, 0)' }}>
                                <div className="text-slate-900 font-extrabold text-[22px] tracking-tight whitespace-nowrap">
                                    듣는만큼 보인다, 투어라이브
                                </div>
                                <Star className="w-6 h-6 text-[#FF9F00] fill-current" />
                            </div>

                            {/* Main Content Layout */}
                            <div className="flex-1 flex items-center px-[120px] py-[60px] gap-[60px]">
                                {/* Left Side: Arched Photo Area */}
                                <div className="relative w-[360px] h-[360px] shrink-0">
                                    {/* Decorative Stars (Top Left of Arched Photo) */}
                                    <div className="absolute -left-8 -top-4 text-[#FF9F00] opacity-60">
                                        <Star className="w-8 h-8 fill-current" />
                                        <Star className="w-5 h-5 fill-current ml-4 -mt-2" />
                                    </div>

                                    {/* The Pill Shape Clip */}
                                    <div className="w-full h-full rounded-[190px] border-[3px] border-[#FF9F00] overflow-hidden relative shadow-lg bg-slate-50">
                                        {profileImageUrl ? (
                                            <img 
                                                src={profileImageUrl} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Sparkles className="w-20 h-20 text-slate-200" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Inner Accent Star */}
                                    <div className="absolute -right-4 top-1/3 text-[#FF9F00]">
                                        <Sparkles className="w-10 h-10" />
                                    </div>
                                </div>

                                {/* Right Side: Identity Info Area (Strict Vertical Alignment) */}
                                <div className="flex flex-col justify-center items-start text-left space-y-6 flex-1 min-w-0 pr-[40px]">
                                    <div className="space-y-2 w-full">
                                        <div className="flex items-center gap-4">
                                            <p className="text-[#FF9F00] font-black text-[22px] tracking-widest leading-none">투어라이브 크루 {term}기</p>
                                        </div>
                                        <div className="flex items-baseline gap-4 w-full">
                                            <h2 className={cn(
                                                "font-black text-black leading-none tracking-tighter truncate",
                                                nickname.length > 8 ? "text-[72px]" : "text-[96px]"
                                            )}>
                                                {nickname}
                                            </h2>
                                            <span className="text-[24px] font-bold text-slate-400 pb-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                {travelLocation}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hashtags Area (Aligned to Nickname) */}
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 max-h-[120px] overflow-hidden">
                                            {hashtags.length > 0 ? hashtags.map((tag, idx) => (
                                                <span key={idx} className="text-[30px] font-black text-black tracking-tight leading-tight">#{tag}</span>
                                            )) : (
                                                <span className="text-[30px] font-black text-slate-200 tracking-tight leading-tight italic">#태그 미지정</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Decorative Elements (Aligned) */}
                                    <div className="relative h-12 w-full mt-4">
                                        <div className="absolute left-0 bottom-0 text-[#FF9F00] opacity-80 flex items-center gap-4">
                                            <Plane className="w-10 h-10 rotate-45" />
                                            <div className="w-32 h-6 border-b-2 border-dashed border-[#FF9F00] opacity-40 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Branding */}
                            <div className="absolute bottom-[48px] right-[60px] flex items-center h-[50px] w-auto">
                                <img src="/logo_black.png" alt="Tourlive Logo" className="h-full w-auto object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Scale Overlay for UI Preview */}
                <style jsx global>{`
                    :root {
                        --banner-scale: calc(min(100vw - 80px, 600px) / 1200);
                    }
                    @media (min-width: 1024px) {
                        --banner-scale: calc(min(100vw - 400px, 600px) / 1200);
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #FFD9C6;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #FF5C00;
                    }
                `}</style>

                <p className="text-xs font-bold text-slate-400 mt-2 italic px-8 py-2 bg-slate-100 rounded-full">
                    {isFullSize ? "현재 원본 크기(1200x520)로 표시 중입니다." : "위 이미지는 미리보기이며, 다운로드 시 정규 사이즈(1200x520)로 저장됩니다."}
                </p>
            </div>
        </div>
    );
}
