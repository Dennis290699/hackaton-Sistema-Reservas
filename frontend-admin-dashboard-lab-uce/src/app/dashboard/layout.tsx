import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#0D1310] text-[#E0EAE3]">
            <Sidebar />
            {/* Main Content Area */}
            <main className="flex-1 ml-24 lg:ml-32 p-4 md:p-8 h-screen overflow-y-auto overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
