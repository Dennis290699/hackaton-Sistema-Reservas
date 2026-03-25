"use client";

import { useState } from "react";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { MainCalendar } from "@/components/dashboard/MainCalendar";
import { RightPanel } from "@/components/dashboard/RightPanel";

export default function DashboardPage() {
    const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());

    return (
        <div className="flex flex-col h-full">
            <TopHeader />

            <div className="flex flex-1 overflow-hidden pb-4">
                {/* Main Content Area (Calendar) */}
                <div className="flex-1 overflow-hidden h-full rounded-3xl bg-[#0D1310] border border-[#1C2721] p-6 shadow-xl">
                    <MainCalendar currentViewDate={currentViewDate} setCurrentViewDate={setCurrentViewDate} />
                </div>

                {/* Right Sidebar Panel */}
                <RightPanel currentViewDate={currentViewDate} />
            </div>
        </div>
    );
}
