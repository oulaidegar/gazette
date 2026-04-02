"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Book, Scale, FileText, Gavel, AlertCircle, FileClock, ScrollText } from "lucide-react";

interface Term {
    id: string;
    term: string;
    arabic: string;
    definition: string;
    context: string;
    icon: any;
}

const terms: Term[] = [
    {
        id: "law",
        term: "Law (Qanun)",
        arabic: "قانون",
        definition: "Legislation passed by the Parliament. It is the highest form of legislation after the Constitution.",
        context: "Laws establish the general rules and frameworks. They require a parliamentary vote.",
        icon: Scale
    },
    {
        id: "decree_cabinet",
        term: "Decree (Marsoum)",
        arabic: "مرسوم",
        definition: "An executive order issued by the President and Prime Minister (and relevant Ministers).",
        context: "Used to implement laws or organize administrative matters. Does not require a parliamentary vote.",
        icon: FileText
    },
    {
        id: "decision",
        term: "Decision (Qarar)",
        arabic: "قرار",
        definition: "Administrative decision issued by a specific Minister or Director General.",
        context: "Applies to specific cases or internal ministry regulations. Lower hierarchy than Decree.",
        icon: Gavel
    },
    {
        id: "circular",
        term: "Circular (Ta'mim)",
        arabic: "تعميم",
        definition: "Instructions issued by a ministry to its departments or to the public clarifying how to apply a law.",
        context: "Does not create new laws but interprets existing ones.",
        icon: ScrollText
    },
    {
        id: "urgent_bill",
        term: "Urgent Bill",
        arabic: "مشروع قانون معجل مكرر",
        definition: "A draft law presented to Parliament with a request for expedited review.",
        context: "Allows voting in a single session without passing through committees (often controversial).",
        icon: FileClock
    },
    {
        id: "notice",
        term: "Official Notice",
        arabic: "إعلام / تبليغ",
        definition: "Public announcement regarding auctions, court rulings, or administrative changes.",
        context: "Published in the Gazette to ensure public knowledge.",
        icon: AlertCircle
    }
];

export function TermCard({ term }: { term: Term }) {
    // Clean, professional card without flip animation
    return (
        <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <term.icon className="h-6 w-6" />
                </div>
                <span className="text-lg font-arabic font-medium text-slate-500 dark:text-slate-400">{term.arabic}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{term.term}</h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {term.definition}
            </p>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Context</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {term.context}
                </p>
            </div>
        </div>
    );
}

export function TerminologySection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terms.map((term) => (
                <TermCard key={term.id} term={term} />
            ))}
        </div>
    );
}
