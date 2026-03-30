"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Award, Rocket, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const challenges = [
    {
        id: 1,
        title: "3월 베스트 후기왕 챌린지",
        desc: "이달의 가장 유용한 후기를 작성한 크루 3분께 특별 리워드를 드립니다.",
        reward: "투어라이브 50,000 포인트",
        status: "진행 중",
        participants: 124
    },
    {
        id: 2,
        title: "숨겨진 명소 발굴단",
        desc: "알려지지 않은 유럽의 소도시 정보를 공유하고 명예 뱃지를 획득하세요.",
        reward: "스페셜 디지털 뱃지",
        status: "진행 중",
        participants: 58
    }
];

export default function ChallengePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 lg:px-10 lg:py-16 space-y-12 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF5C00] shadow-sm shadow-orange-100">
                        <Trophy className="w-6 h-6" />
                    </div>
                    이달의 챌린지
                </h1>
                <p className="text-lg font-bold text-slate-400 ml-16">특별한 미션에 도전하고 풍성한 혜택을 누리세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {challenges.map((challenge) => (
                    <Card key={challenge.id} className="rounded-[40px] border-slate-100 group cursor-pointer hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-700 overflow-hidden bg-white flex flex-col">
                        <CardHeader className="p-10 pb-6">
                            <div className="flex items-center justify-between mb-4">
                                <Badge className="bg-[#FFF5F1] text-[#FF5C00] hover:bg-[#FFF5F1] border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest">{challenge.status}</Badge>
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                                    <Target className="w-3 h-3" />
                                    {challenge.participants}명 참여 중
                                </span>
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-800 group-hover:text-[#FF5C00] transition-colors tracking-tight">{challenge.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-10 pb-10 flex-1 flex flex-col justify-between space-y-8">
                            <p className="text-slate-500 font-bold leading-relaxed">{challenge.desc}</p>
                            
                            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-100 group-hover:bg-white group-hover:border-[#FFD9C6] group-hover:shadow-lg group-hover:shadow-orange-100/30 transition-all duration-500">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reward</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-slate-800 group-hover:text-[#FF5C00] transition-colors">{challenge.reward}</span>
                                    <Award className="w-6 h-6 text-slate-200 group-hover:text-[#FF5C00] transition-all" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-12 rounded-[48px] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5C00] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative z-10 space-y-6 max-w-xl">
                    <Rocket className="w-12 h-12 text-[#FF5C00] group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
                    <h2 className="text-3xl font-black tracking-tight leading-tight">새로운 챌린지 협업<br/>제안이 있으신가요?</h2>
                    <p className="text-slate-400 font-bold">크루원들과 함께하고 싶은 재미있는 활동이 있다면 언제든 제안해 주세요. 선정 시 소정의 포인트를 드립니다.</p>
                    <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black gap-2 transition-all hover:scale-105 active:scale-95">
                        챌린지 제안하기
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
