"use client";

import Link from "next/link";
import { Calendar, FileText, Building2, ChevronRight } from "lucide-react";
import { LegalUnitSummary } from "@/lib/api";
import { motion } from "framer-motion";

interface ResultCardProps {
    result: LegalUnitSummary;
    index: number;
    highlightTerms?: string[];
}

export function ResultCard({ result, index, highlightTerms = [] }: ResultCardProps) {
    // Helper to highlight terms
    const renderContent = (text: string) => {
        if (!highlightTerms.length || !text) return text;

        // Escape terms for regex
        const terms = highlightTerms
            .filter(t => t && t.length > 2)
            .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        if (!terms.length) return text;

        const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
        const parts = text.split(pattern);

        return parts.map((part, i) =>
            terms.some(t => part.toLowerCase() === t.toLowerCase()) ?
                <span key={i} className="bg-yellow-200 text-yellow-900 font-semibold px-0.5 rounded">{part}</span> :
                part
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                href={`/legal-units/${result.id}`}
                className="block group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-wide">
                            {result.type || "Document"}
                        </span>
                        {result.unit_number && (
                            <span className="text-xs text-gray-500 font-mono">
                                No. {result.unit_number}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                        View Details <ChevronRight className="h-3 w-3" />
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors dir-rtl text-right">
                    {result.title || "Untitled Document"}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    {result.issuer && (
                        <div className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            <span>{result.issuer}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>Issue {result.source.issue_number} ({result.source.year})</span>
                    </div>

                    {result.similarity > 0 && (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{(result.similarity * 100).toFixed(0)}% Match</span>
                        </div>
                    )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 dir-rtl text-right font-arabic">
                    {renderContent(result.content_preview)}
                </p>
            </Link>
        </motion.div>
    );
}
