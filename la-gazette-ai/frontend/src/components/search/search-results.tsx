import { LegalUnitSummary } from "@/lib/api";
import { ResultCard } from "@/components/search/result-card";

interface SearchResultsProps {
    results: LegalUnitSummary[];
    highlightTerms?: string[];
}

export function SearchResults({ results, highlightTerms }: SearchResultsProps) {
    if (!results || results.length === 0) return null;

    return (
        <div className="space-y-4">
            {results.map((result, index) => (
                <ResultCard
                    key={result.id}
                    result={result}
                    index={index}
                    highlightTerms={highlightTerms}
                />
            ))}
        </div>
    );
}
