import { api, SearchResponse } from "@/lib/api";
import { SearchInput } from "@/components/ui/search-input";
import { ResultCard } from "@/components/search/result-card";
import { Filter, SlidersHorizontal } from "lucide-react";

export default async function SearchPage(props: {
    searchParams: Promise<{ q: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || "";
    let data: SearchResponse | null = null;
    let error = null;

    if (query) {
        try {
            data = await api.search(query);
        } catch (e) {
            error = "Failed to fetch results. Please try again.";
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    {/* Logo Removed */}
                    <div className="flex-1 max-w-2xl">
                        <SearchInput className="h-10 text-base" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters (Desktop) */}
                    <aside className="hidden lg:block w-64 shrink-0 space-y-8">
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Filter className="h-4 w-4" /> Filters
                            </h3>
                            <div className="space-y-2">
                                {/* Placeholder filters */}
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                                    Filters coming soon...
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-lg font-medium text-slate-900 dark:text-white">
                                {query ? `Results for "${query}"` : "Enter a search query"}
                            </h1>
                            <span className="text-sm text-slate-500">
                                {data?.total || 0} results found
                            </span>
                        </div>

                        {error ? (
                            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                                {error}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data?.results.map((result, index) => (
                                    <ResultCard key={result.id} result={result} index={index} />
                                ))}

                                {data?.results.length === 0 && (
                                    <div className="text-center py-20">
                                        <p className="text-slate-500 text-lg">No results found for your query.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
