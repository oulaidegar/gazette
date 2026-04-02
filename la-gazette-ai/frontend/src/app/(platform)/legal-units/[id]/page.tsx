import { api } from "@/lib/api";
import { DocumentViewer } from "@/components/document/document-viewer";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DocumentPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    let document;

    try {
        document = await api.getLegalUnit(params.id);
    } catch (error) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Specific Header for Document View */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href="/search"
                        className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Search
                    </Link>

                    <span className="font-mono text-xs text-slate-400">
                        ID: {params.id.slice(0, 8)}
                    </span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <DocumentViewer document={document} />
            </main>
        </div>
    );
}
