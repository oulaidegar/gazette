"use client";

import { useEffect, useState } from "react";
import { api, Issue } from "@/lib/api";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Calendar, ChevronRight, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IssueSidebarProps {
    selectedIssue: { year: number; issue_number: number } | null;
    onSelect: (issue: { year: number; issue_number: number } | null) => void;
}

export function IssueSidebar({ selectedIssue, onSelect }: IssueSidebarProps) {
    const [years, setYears] = useState<number[]>([]);
    const [expandedYear, setExpandedYear] = useState<number | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loadingYears, setLoadingYears] = useState(true);
    const [loadingIssues, setLoadingIssues] = useState(false);

    // 1. Fetch available years (from stats or hardcoded range)
    useEffect(() => {
        const fetchYears = async () => {
            try {
                const stats = await api.getStats();
                // Extract years from stats and sort desc
                const availableYears = stats.by_year.map(y => parseInt(y.name)).sort((a, b) => b - a);
                setYears(availableYears.length > 0 ? availableYears : [2025, 2024]);

                // Expand first year by default if no selection
                if (!selectedIssue && availableYears.length > 0) {
                    setExpandedYear(availableYears[0]);
                } else if (selectedIssue) {
                    setExpandedYear(selectedIssue.year);
                }
            } catch (e) {
                console.error("Failed to fetch years", e);
                setYears([2025, 2024]); // Fallback
            } finally {
                setLoadingYears(false);
            }
        };
        fetchYears();
    }, []);

    // 2. Fetch issues when year expanded
    useEffect(() => {
        if (!expandedYear) return;

        const fetchIssues = async () => {
            setLoadingIssues(true);
            try {
                const res = await api.listIssues(expandedYear);
                setIssues(res.issues);
            } catch (e) {
                console.error("Failed to fetch issues", e);
            } finally {
                setLoadingIssues(false);
            }
        };
        fetchIssues();
    }, [expandedYear]);

    if (loadingYears) {
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>;
    }

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 dark:text-white">Browse Issues</h3>
                {selectedIssue && (
                    <Button variant="ghost" size="sm" onClick={() => onSelect(null)} className="h-8 px-2 text-xs hover:bg-slate-200 dark:hover:bg-slate-700">
                        Clear
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {years.map(year => (
                    <div key={year} className="space-y-1">
                        <button
                            onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                            className={cn(
                                "w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors",
                                expandedYear === year
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {year}
                            </span>
                            {expandedYear === year ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>

                        {expandedYear === year && (
                            <div className="pl-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                                {loadingIssues ? (
                                    <div className="py-2 pl-2"><Loader2 className="animate-spin h-4 w-4 text-slate-400" /></div>
                                ) : issues.length === 0 ? (
                                    <div className="py-2 pl-2 text-xs text-slate-400">No issues found</div>
                                ) : (
                                    issues.map(issue => (
                                        <button
                                            key={issue.id}
                                            onClick={() => onSelect({ year: issue.year, issue_number: issue.issue_number })}
                                            className={cn(
                                                "w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors flex items-center justify-between group",
                                                selectedIssue?.issue_number === issue.issue_number && selectedIssue?.year === issue.year
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span>Issue #{issue.issue_number}</span>
                                                <span className="text-[10px] text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300">
                                                    {issue.publication_date || "Unknown Date"} • {issue.total_pages || 0} pages
                                                </span>
                                            </div>
                                            {selectedIssue?.issue_number === issue.issue_number && selectedIssue?.year === issue.year && (
                                                <Check className="h-3 w-3 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
