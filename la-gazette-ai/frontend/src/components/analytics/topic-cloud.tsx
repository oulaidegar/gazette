"use client";

import { KeywordItem } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TopicCloudProps {
    keywords: KeywordItem[];
}

export function TopicCloud({ keywords }: TopicCloudProps) {
    if (!keywords || keywords.length === 0) return null;

    const maxVal = Math.max(...keywords.map(k => k.value));
    const minVal = Math.min(...keywords.map(k => k.value));

    // Normalize size between 0.8rem and 2.5rem
    const getSize = (value: number) => {
        if (maxVal === minVal) return "1rem";
        const normalized = (value - minVal) / (maxVal - minVal);
        const size = 0.8 + (normalized * 1.7);
        return `${size}rem`;
    };

    const getWeight = (value: number) => {
        const normalized = (value - minVal) / (maxVal - minVal);
        if (normalized > 0.8) return "font-bold";
        if (normalized > 0.5) return "font-semibold";
        return "font-medium";
    };

    const getColor = (index: number) => {
        const colors = [
            "text-slate-700 dark:text-slate-200",
            "text-blue-700 dark:text-blue-300",
            "text-emerald-700 dark:text-emerald-300",
            "text-violet-700 dark:text-violet-300",
            "text-amber-700 dark:text-amber-300",
        ];
        return colors[index % colors.length];
    }

    return (
        <div className="flex flex-wrap gap-4 justify-center p-4">
            {keywords.map((item, i) => (
                <span
                    key={item.text}
                    className={cn(
                        "transition-all hover:scale-110 cursor-default",
                        getWeight(item.value),
                        getColor(i)
                    )}
                    style={{ fontSize: getSize(item.value) }}
                    title={`${item.value} occurrences`}
                >
                    {item.text}
                </span>
            ))}
        </div>
    );
}
