"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markPointsPaid } from "@/app/actions/mission";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function MarkPaidButton({ missionId, isPaid }: { missionId: string, isPaid: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMarkPaid = async () => {
        setLoading(true);
        const res = await markPointsPaid(missionId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("포인트 지급 처리가 완료되었습니다.");
            router.refresh();
        }
        setLoading(false);
    };

    if (isPaid) {
        return (
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                <Check className="w-3.5 h-3.5" />
                지급 완료
            </div>
        );
    }

    return (
        <Button 
            size="sm" 
            variant="outline" 
            onClick={handleMarkPaid} 
            disabled={loading}
            className="h-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[10px] px-3 transition-colors"
        >
            {loading ? "처리 중..." : "Mark Points as Paid"}
        </Button>
    );
}
