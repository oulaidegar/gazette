"use client";

import { TerminologySection } from "@/components/information/term-card";
import { RightsSection } from "@/components/information/rights-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Scale, Book } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";

export default function InformationPage() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />
            <div className="flex-1 lg:pl-64">
                <div className="p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto space-y-10">

                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                Legal Reference
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                                The Official Gazette is more than just an archive—it is the record of your rights and obligations as a citizen.
                                Understanding the terminology and the legal framework is essential for civic participation.
                            </p>
                        </div>

                        {/* Content Tabs */}
                        <Tabs defaultValue="lingo" className="space-y-8">
                            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
                                <TabsTrigger value="lingo" className="flex items-center gap-2">
                                    <Book className="h-4 w-4" />
                                    Legal Terminology
                                </TabsTrigger>
                                <TabsTrigger value="rights" className="flex items-center gap-2">
                                    <Scale className="h-4 w-4" />
                                    Your Rights
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="lingo" className="space-y-6">
                                <div className="rounded-lg bg-blue-50 border border-blue-100 p-6 dark:bg-blue-950/20 dark:border-blue-900/30">
                                    <div className="flex items-start gap-4">
                                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Why Definitions Matter</h3>
                                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                                Legal texts are precise. A "Decree" has different implications than a "Decision."
                                                Knowing the difference allows you to understand the hierarchy of laws and how they affect you.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <TerminologySection />
                            </TabsContent>

                            <TabsContent value="rights" className="space-y-6">
                                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-6 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                                    <div className="flex items-start gap-4">
                                        <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Constitutional Guarantees</h3>
                                            <p className="text-sm text-emerald-800 dark:text-emerald-300">
                                                The Lebanese Constitution of 1926 (as amended) is the supreme law of the land.
                                                No law or decree can contradict the principles enshrined within it.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <RightsSection />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
