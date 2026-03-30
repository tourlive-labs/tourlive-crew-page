import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F9F8F3]">
            <Sidebar />
            
            {/* Main Content Area */}
            <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
