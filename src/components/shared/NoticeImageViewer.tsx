"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface NoticeImageViewerProps {
    imageUrls: string[];
    title: string;
}

export default function NoticeImageViewer({ imageUrls, title }: NoticeImageViewerProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
    const touchStartDist = useRef<number | null>(null);
    const touchStartScale = useRef(1);

    const resetView = () => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        resetView();
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
        resetView();
    };

    const navigate = (dir: 1 | -1) => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex + dir + imageUrls.length) % imageUrls.length);
        resetView();
    };

    const clampScale = (s: number) => Math.min(5, Math.max(1, s));

    const zoomIn = () => setScale(s => clampScale(s + 0.5));
    const zoomOut = () => setScale(s => {
        const next = clampScale(s - 0.5);
        if (next === 1) setTranslate({ x: 0, y: 0 });
        return next;
    });

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setScale(s => {
            const next = clampScale(s + delta);
            if (next === 1) setTranslate({ x: 0, y: 0 });
            return next;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !dragStart.current) return;
        setTranslate({
            x: dragStart.current.tx + (e.clientX - dragStart.current.x),
            y: dragStart.current.ty + (e.clientY - dragStart.current.y),
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStart.current = null;
    };

    const getTouchDist = (touches: React.TouchList) =>
        Math.hypot(
            touches[1].clientX - touches[0].clientX,
            touches[1].clientY - touches[0].clientY
        );

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            touchStartDist.current = getTouchDist(e.touches);
            touchStartScale.current = scale;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length !== 2 || touchStartDist.current === null) return;
        const next = clampScale(touchStartScale.current * (getTouchDist(e.touches) / touchStartDist.current));
        if (next === 1) setTranslate({ x: 0, y: 0 });
        setScale(next);
    };

    const handleTouchEnd = () => {
        touchStartDist.current = null;
    };

    if (imageUrls.length === 0) return null;

    return (
        <>
            <div className={cn(
                "grid gap-2",
                imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
                {imageUrls.map((url, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => openLightbox(i)}
                        className={cn(
                            "rounded-brand overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in relative group text-left",
                            imageUrls.length > 1 && "aspect-square"
                        )}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`${title} 이미지 ${i + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-6 h-6 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>
                ))}
            </div>

            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center select-none">
                    {/* Top-right controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                        <button
                            onClick={zoomOut}
                            disabled={scale <= 1}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="축소"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-white/80 text-sm font-bold tabular-nums w-12 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            disabled={scale >= 5}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="확대"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                            onClick={closeLightbox}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors ml-1"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Prev / Next */}
                    {imageUrls.length > 1 && (
                        <>
                            <button
                                onClick={() => navigate(-1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
                                aria-label="이전"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => navigate(1)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
                                aria-label="다음"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div
                        className={cn(
                            isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-default"
                        )}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrls[lightboxIndex]}
                            alt={`${title} 이미지 ${lightboxIndex + 1}`}
                            className="max-w-[90vw] max-h-[85vh] object-contain"
                            style={{
                                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                                transition: isDragging ? "none" : "transform 0.15s ease-out",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Backdrop */}
                    <div className="absolute inset-0 -z-10" onClick={closeLightbox} />

                    {/* Dot indicators */}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {imageUrls.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setLightboxIndex(i); resetView(); }}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all",
                                        i === lightboxIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
                                    )}
                                    aria-label={`이미지 ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
