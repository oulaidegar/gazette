"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
    basePath?: string;
}

export function SearchInput({ className, placeholder = "Search for laws, decrees...", autoFocus = false, basePath = "/search" }: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`${basePath}?q=${encodeURIComponent(query)}`);
    };

    const clearSearch = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <form onSubmit={handleSearch} className={cn("relative w-full max-w-2xl group", className)}>
            <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={cn(
                        "w-full h-14 pl-12 pr-12 rounded-2xl border border-gray-200 bg-white",
                        "shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-300",
                        "text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                        "dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    )}
                    placeholder={placeholder}
                />

                <AnimatePresence>
                    {query && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </form>
    );
}
