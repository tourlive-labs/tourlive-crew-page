export default function RootPage() {
    // This page is purely a fallback. 
    // All routing logic is centralized in src/middleware.ts.
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
