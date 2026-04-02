"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, BarChart3, Home, Settings, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Explorer", href: "/explorer", icon: Compass },
    { name: "My Library", href: "/library", icon: Home },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Information", href: "/information", icon: Compass },
    { name: "Pinpoint", href: "https://journaliststudio.google.com/pinpoint/search?collection=f707eb477284ddf4&spt=2&p=1&docid=33f7ca355388abc_f707eb477284ddf4&entities=%2Fg%2F11f3f1r9l1", icon: Search },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 w-64 fixed left-0 top-0 z-40 hidden lg:flex">
            <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <span>Lebanese <span className="text-blue-600">Gazette</span></span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isExternal = item.href.startsWith("http");
                        const isActive = !isExternal && (pathname === item.href || pathname?.startsWith(item.href + "/"));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive
                                            ? "text-blue-700 dark:text-blue-400"
                                            : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300"
                                    )}
                                />
                                {item.name}
                                {isExternal && <span className="ml-auto text-xs text-slate-400">↗</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500">THEME</span>
                    <ModeToggle />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">LM</span>
                    </div>
                    <div className="text-xs">
                        <p className="font-medium text-slate-900 dark:text-slate-100">User</p>
                        <p className="text-slate-500">user@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
