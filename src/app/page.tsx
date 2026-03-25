export default function RootPage() {
    // This page is purely a fallback. 
    // All routing logic is centralized in src/middleware.ts.
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
            <div className="w-12 h-12 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
