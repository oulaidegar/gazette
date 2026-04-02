"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";
import { EntitySidebar } from "@/components/explorer/entity-sidebar";
import { IssueSidebar } from "@/components/explorer/issue-sidebar";
import { SearchResults } from "@/components/search/search-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, LegalUnitSummary, EntityItem } from "@/lib/api";
import { Loader2 } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";

function ExplorerContent() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get("q") || "";

    const [activeTab, setActiveTab] = useState("entities");
    const [selectedEntity, setSelectedEntity] = useState<EntityItem | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<{ year: number; issue_number: number } | null>(null);
    const [results, setResults] = useState<LegalUnitSummary[]>([]);
    const [loading, setLoading] = useState(false);

    // Clear other selection when switching tabs or making a selection
    useEffect(() => {
        if (activeTab === "entities") setSelectedIssue(null);
        if (activeTab === "issues") setSelectedEntity(null);
    }, [activeTab]);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // Determine if we should search
                const hasSelection = selectedEntity || selectedIssue;
                const q = queryParam || (hasSelection ? " " : "");

                if (!q) {
                    setResults([]);
                    setLoading(false);
                    return;
                }

                const res = await api.search(q, 50, {
                    entity_id: selectedEntity?.id,
                    year: selectedIssue?.year,
                    issue_number: selectedIssue?.issue_number ? Number(selectedIssue.issue_number) : undefined
                });
                setResults(res.results);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [queryParam, selectedEntity, selectedIssue]);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />
            <main className="flex-1 lg:pl-64 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explorer</h1>
                            <p className="text-slate-500">
                                {activeTab === "entities"
                                    ? "Filter documents by People, Organizations, and Locations."
                                    : "Browse the Official Gazette archive by Year and Issue."}
                            </p>
                        </div>

                        <SearchInput
                            className="max-w-xl shadow-sm"
                            placeholder="Search within documents..."
                            basePath="/explorer"
                        />

                        {/* Results Area */}
                        {loading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
                        ) : (
                            <div className="space-y-4">
                                {(selectedEntity || selectedIssue) && (
                                    <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-lg text-sm inline-flex items-center">
                                        Filtering by:
                                        <span className="font-semibold ml-1">
                                            {selectedEntity ? selectedEntity.name : `Issue #${selectedIssue?.issue_number} (${selectedIssue?.year})`}
                                        </span>
                                    </div>
                                )}

                                {results.length > 0 ? (
                                    <SearchResults
                                        results={results}
                                        highlightTerms={[queryParam, selectedEntity?.name].filter(Boolean) as string[]}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        {(queryParam || selectedEntity || selectedIssue) ? "No documents found." : "Select an item to explore."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar (Filters) - Moved to Right */}
                    <div className="w-full lg:w-80 flex-shrink-0 h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 flex flex-col gap-4 order-last">
                        <Tabs defaultValue="entities" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                            <TabsList className="w-full grid grid-cols-2 mb-4">
                                <TabsTrigger value="entities">Entities</TabsTrigger>
                                <TabsTrigger value="issues">Issues</TabsTrigger>
                            </TabsList>

                            <TabsContent value="entities" className="flex-1 mt-0 h-full overflow-hidden">
                                <EntitySidebar
                                    selectedEntityId={selectedEntity?.id || null}
                                    onSelect={setSelectedEntity}
                                />
                            </TabsContent>

                            <TabsContent value="issues" className="flex-1 mt-0 h-full overflow-hidden">
                                <IssueSidebar
                                    selectedIssue={selectedIssue}
                                    onSelect={setSelectedIssue}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ExplorerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <ExplorerContent />
        </Suspense>
    );
}
