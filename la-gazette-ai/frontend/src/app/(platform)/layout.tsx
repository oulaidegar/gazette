import { Sidebar } from "@/components/layout/Sidebar";

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />
            <div className="lg:pl-64 min-h-screen flex flex-col">
                {children}
            </div>
        </div>
    );
}
