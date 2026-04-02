"use client";

import { Suspense } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { LatestIssueSummary } from "@/components/home/latest-issue-summary";
import { CedarTree } from "@/components/home/cedar-tree";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { ArrowRight, Search, FileText, Database } from "lucide-react";

export default function Home() {
    return (
        <main className="relative min-h-[300vh] w-full bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            {/* The Animated SVG Tree Background */}
            <div className="absolute inset-0 z-0">
                <CedarTree />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full pb-32">

                {/* SECTION 1: The Canopy (Hero) */}
                <section className="h-screen w-full flex flex-col items-center justify-center p-6 sm:p-24 relative pt-20">
                    <div className="w-full max-w-5xl mx-auto space-y-12 text-center relative">
                        {/* Title area with text shadow for readability over glowing tree */}
                        <div className="space-y-6">
                            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                The Official Digital <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 filter drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                    Lebanese Gazette
                                </span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                                A luminous archive of laws, decrees, and decisions. Search the unsearchable with AI-powered semantic technology.
                            </p>
                        </div>

                        {/* Search Input floating over the canopy */}
                        <GlassCard variant="light" blur="lg" className="p-2 max-w-2xl mx-auto">
                            <div className="bg-slate-900/50 rounded-xl overflow-hidden backdrop-blur-md">
                                <Suspense fallback={<div className="h-12 w-full animate-pulse bg-slate-800/50" />}>
                                    <SearchInput className="w-full border-none shadow-none bg-transparent text-white placeholder:text-slate-400 focus-visible:ring-0" autoFocus />
                                </Suspense>
                            </div>
                        </GlassCard>

                        {/* Scroll indicator */}
                        <div className="absolute bottom-[-15vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse">
                            <span className="text-sm font-medium tracking-widest uppercase text-emerald-200">Descend</span>
                            <div className="w-px h-16 bg-gradient-to-b from-emerald-400 to-transparent" />
                        </div>
                    </div>
                </section>

                {/* SECTION 2: The Trunk (Journey/Info) */}
                <section className="h-screen w-full flex items-center p-6 sm:p-24 max-w-7xl mx-auto">
                    <div className="w-full grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
                        {/* Left column empty to let the trunk show through */}
                        <div className="hidden md:block" />

                        {/* Right column with glass info cards */}
                        <div className="space-y-8">
                            <GlassCard variant="dark" blur="lg" className="p-8 space-y-4 border-l-4 border-l-emerald-500">
                                <Search className="w-8 h-8 text-emerald-400" />
                                <h3 className="text-2xl font-bold text-white">Semantic Precision</h3>
                                <p className="text-slate-300 leading-relaxed font-light">
                                    Moving beyond basic keywords. Our hybrid search understands the context and intent of legal queries, illuminating relevant statutes even when exact phasing differs.
                                </p>
                            </GlassCard>

                            <GlassCard variant="dark" blur="lg" className="p-8 space-y-4 border-l-4 border-l-blue-500">
                                <FileText className="w-8 h-8 text-blue-400" />
                                <h3 className="text-2xl font-bold text-white">Digitized Intelligence</h3>
                                <p className="text-slate-300 leading-relaxed font-light">
                                    Thousands of scanned pages meticulously processed and transformed into structured, queryable data spanning from 2014 to the present.
                                </p>
                            </GlassCard>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: The Roots (The Core/Data) */}
                <section className="min-h-screen w-full flex flex-col items-center justify-end p-6 sm:p-24 text-center mt-20">
                    <div className="w-full max-w-4xl mx-auto space-y-16">

                        <div className="space-y-6">
                            <h2 className="text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                The Root of the Law
                            </h2>
                            <p className="text-xl text-blue-200/80 max-w-2xl mx-auto font-light">
                                Dive deep into the underlying structure of the Lebanese state. Over 17,000 legal units extracted, connected, and ready for exploration.
                            </p>
                        </div>

                        {/* Interactive Data Preview */}
                        <GlassCard variant="glow" blur="xl" className="p-8 border-t border-blue-400/30">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-lg font-semibold text-white">Latest Extractions</h3>
                                </div>
                                <span className="text-xs font-mono text-blue-300/60 bg-blue-900/30 px-2 py-1 rounded">LIVE_DATA</span>
                            </div>

                            <div className="opacity-90">
                                <LatestIssueSummary />
                            </div>
                        </GlassCard>

                        {/* Final CTA */}
                        <div className="pt-12">
                            <Link href="/explorer">
                                <button className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full font-medium text-white transition-all overflow-hidden flex items-center gap-3 mx-auto backdrop-blur-md hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                                    <span>Enter the Archive</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 rounded-full border border-white/50 scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                                </button>
                            </Link>
                        </div>

                    </div>
                </section>

            </div>
        </main>
    );
}

