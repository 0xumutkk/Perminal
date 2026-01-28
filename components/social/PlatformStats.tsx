"use client";

import { TrendingUp, Users, BarChart3, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PlatformStats() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
                label="Total Volume"
                value="$12.5M"
                icon={<BarChart3 className="h-4 w-4 text-emerald-400" />}
                trend="+12%"
            />
            <StatsCard
                label="Active Traders"
                value="1,240"
                icon={<Users className="h-4 w-4 text-blue-400" />}
                trend="+5%"
            />
            <StatsCard
                label="Open Markets"
                value="86"
                icon={<Activity className="h-4 w-4 text-amber-400" />}
                trend="+3"
            />
            <StatsCard
                label="Predictions"
                value="34.2K"
                icon={<TrendingUp className="h-4 w-4 text-purple-400" />}
                trend="+18%"
            />
        </div>
    );
}

function StatsCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <Card className="p-4 bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs font-medium">{label}</span>
                {icon}
            </div>
            <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-100">{value}</span>
                <span className="text-xs text-emerald-400 font-medium">{trend}</span>
            </div>
        </Card>
    );
}
