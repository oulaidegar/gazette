"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LatestIssueSummary() {
    const [isExpanded, setIsExpanded] = useState(false);

    // This would ideally come from an API endpoint like /issues/latest/summary
    // For now, we use the specific requested issue 9236.
    const issueNumber = 9236;
    const summary = `
    In the final issue of 2025, the Lebanese government focused heavily on **budgetary adjustments** to ensure the continuity of essential public services. 
    
    Key takeaways for citizens:
    • **Security Funding**: Significant reallocations were made to the State Security Directorate under the Presidency of the Council of Ministers to maintain operational readiness.
    • **Infrastructure**: Funds were transferred to the Council for Development and Reconstruction (CDR) to complete government buildings in the Chhim area, signaling a push to finish stalled projects.
    • **Finance Ministry Support**: The General Directorate of Finance received additional budget adjustments to streamline fiscal operations for the upcoming year.
    • **Administrative Updates**: Routine administrative notifications and subscription renewals were processed to keep government departments functioning.

    This issue reflects a "housekeeping" approach to close out the 2025 fiscal year, prioritizing internal stability and the completion of specific regional development projects over major legislative overhauls.
  `;

    return (
        <div className="w-full max-w-3xl mx-auto mt-8 px-4">
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-300",
                    isExpanded ? "border-blue-200 dark:border-blue-800 ring-2 ring-blue-100 dark:ring-blue-900/30" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
            >
                {/* Header / Click Area */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full text-left p-5 focus:outline-none group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">AI Summary • Issue {issueNumber}</span>
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
                        Closing 2025: Key Budget Reallocations & Infrastructure Push
                    </h3>

                    <div className="relative">
                        <div
                            className={cn(
                                "text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line",
                                !isExpanded && "max-h-[3.6rem] overflow-hidden" // Show roughly 2-3 lines
                            )}
                        >
                            {summary}
                        </div>

                        {/* Gradient Overlay when collapsed */}
                        {!isExpanded && (
                            <div className="absolute inset-0 top-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 pointer-events-none" />
                        )}
                    </div>

                    {!isExpanded && (
                        <div className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                            Read full summary
                        </div>
                    )}
                </button>

                {/* Expanded Content (Extra details if any, or just the full text above expands) */}
                {/* In this design, the text above expands, but we could add a footer here */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/50 pt-4"
                        >
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-800 dark:text-blue-200">
                                <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>
                                    This summary was generated by AI based on the official titles and texts of 54 legal units found in Issue 9236. Always verify with the original text.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
