
"use client";

import { useEffect, useState } from "react";
import { api, TimelineItem } from "@/lib/api";
import { Loader2, Search, ArrowRight, Circle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LegislativeTimeline() {
    const [query, setQuery] = useState("Tax");
    const [data, setData] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchData(q: string) {
        if (!q) return;
        setLoading(true);
        try {
            const res = await api.getTimeline(q);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData(query);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(query);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-96">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Legislative Journey</h3>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="search bill..."
                        className="h-9 w-48"
                    />
                    <Button size="sm" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </Button>
                </form>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                {data.length === 0 && !loading ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No events found.
                    </div>
                ) : (
                    <div className="flex items-center gap-4 h-full min-w-max px-4">
                        {data.map((item, index) => (
                            <div key={item.id} className="relative flex flex-col items-center group w-64">
                                {/* Line connector */}
                                {index < data.length - 1 && (
                                    <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-slate-200 -z-10 transform translate-y-[-14px]" />
                                )}

                                {/* Node */}
                                <div className="w-8 h-8 rounded-full bg-indigo-100 border-4 border-white shadow-sm flex items-center justify-center mb-4 z-10 group-hover:scale-110 transition-transform">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                </div>

                                {/* Card */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full hover:shadow-md transition-shadow">
                                    <div className="text-xs font-medium text-slate-500 mb-1">{item.date}</div>
                                    <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-tight mb-2" title={item.title}>
                                        {item.title}
                                    </h4>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
