"use client";

import { LegalUnitDetail } from "@/lib/api";
import { FileText, Calendar, Building2, BookOpen } from "lucide-react";
import { BookmarkButton } from "@/components/library/bookmark-button";

interface DocumentViewerProps {
    document: LegalUnitDetail;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8 border-b border-gray-100 pb-8">
                <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
                        {document.type || "Document"}
                    </span>
                    {document.unit_number && (
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600 font-mono">
                            No. {document.unit_number}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dir-rtl text-right leading-tight max-w-3xl">
                        {document.title || "Untitled Document"}
                    </h1>
                    <BookmarkButton legalUnitId={document.id} size="lg" className="shrink-0" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-2xl p-6">
                    {document.issuer && (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Issuer</p>
                                <p className="font-medium text-gray-900">{document.issuer}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Source</p>
                            <p className="font-medium text-gray-900">
                                Issue {document.source.issue_number}, Page {document.source.page_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Year</p>
                            <p className="font-medium text-gray-900">{document.source.year}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <article className="prose prose-lg max-w-none dir-rtl text-right font-arabic">
                <div className="whitespace-pre-wrap leading-loose text-gray-800 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                    {document.content}
                </div>
            </article>

            {/* Structured Data (if available) */}
            {document.is_table && document.table_data && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Structured Data</h3>
                    <div className="bg-gray-50 p-4 rounded-xl overflow-x-auto">
                        <pre className="text-xs">{JSON.stringify(document.table_data, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
