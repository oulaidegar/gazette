
"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api, MapItem } from "@/lib/api";
import { Loader2, MapPin } from "lucide-react";

const REGION_COLORS = {
    "Beirut": "#EF4444",
    "Mount Lebanon": "#F97316",
    "North": "#10B981",
    "South": "#3B82F6",
    "Bekaa": "#8B5CF6",
    "Nabatieh": "#EC4899"
};

export function LebanonMap() {
    const [data, setData] = useState<MapItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await api.getMap();
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-900">Regional Impact</h3>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis dataKey="region" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.region as keyof typeof REGION_COLORS] || "#cbd5e1"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
