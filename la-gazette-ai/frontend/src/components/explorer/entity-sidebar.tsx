"use client";

import { useEffect, useState } from "react";
import { api, EntityItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Check, User, Building, MapPin, Loader2, FilterX } from "lucide-react";
// import { ScrollArea } from "@/components/ui/scroll-area";
const ScrollArea = ({ children, className }: any) => <div className={`overflow-y-auto ${className || ''}`}>{children}</div>;
import { Button } from "@/components/ui/button";

interface EntitySidebarProps {
    selectedEntityId: string | null;
    onSelect: (entity: EntityItem | null) => void;
}

export function EntitySidebar({ selectedEntityId, onSelect }: EntitySidebarProps) {
    const [entities, setEntities] = useState<EntityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                // Fetch top 50 entities of each type
                const [people, orgs, locs] = await Promise.all([
                    api.getTopEntities("PERSON"),
                    api.getTopEntities("ORG"),
                    api.getTopEntities("LOC")
                ]);
                setEntities([...people, ...orgs, ...locs]);
            } catch (error) {
                console.error("Failed to fetch entities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntities();
    }, []);

    const grouped = {
        People: entities.filter(e => e.type === "PERSON"),
        Organizations: entities.filter(e => e.type === "ORG"),
        Locations: entities.filter(e => e.type === "LOC")
    };

    if (loading) {
        return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>;
    }

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
                {selectedEntityId && (
                    <Button variant="ghost" size="sm" onClick={() => onSelect(null)} className="h-8 px-2 text-xs hover:bg-slate-200 dark:hover:bg-slate-700">
                        <FilterX className="mr-1 h-3 w-3" /> Clear
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                {category === "People" && <User className="h-3 w-3" />}
                                {category === "Organizations" && <Building className="h-3 w-3" />}
                                {category === "Locations" && <MapPin className="h-3 w-3" />}
                                {category}
                            </h4>
                            <div className="space-y-1">
                                {items.length === 0 && <p className="text-xs text-slate-400 italic">No entities found</p>}
                                {items.map(entity => (
                                    <button
                                        key={entity.id}
                                        onClick={() => onSelect(selectedEntityId === entity.id ? null : entity)}
                                        className={cn(
                                            "w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors flex items-center justify-between group",
                                            selectedEntityId === entity.id
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <span className="truncate">{entity.name}</span>
                                        {selectedEntityId === entity.id && <Check className="h-3 w-3 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
