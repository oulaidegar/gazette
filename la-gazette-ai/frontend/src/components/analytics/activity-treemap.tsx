
"use client";

import { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { api, TreemapItem } from "@/lib/api";
import { Loader2 } from "lucide-react";

const COLORS = [
    "#8889DD", "#9597E4", "#8DC77B", "#A5D297", "#E2CF45", "#F8C12D"
];

const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : "none",
                    stroke: "#fff",
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                >
                    {name}
                </text>
            ) : null}
            {depth === 1 ? (
                <text
                    x={x + 4}
                    y={y + 18}
                    fill="#fff"
                    fontSize={16}
                    fillOpacity={0.9}
                >
                    {index + 1}
                </text>
            ) : null}
        </g>
    );
};

export function ActivityTreemap() {
    const [data, setData] = useState<TreemapItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await api.getTreemap();
                // Recharts Treemap requires nested structure usually? 
                // Or flat list works? Flat list works for simple treemap.
                // But Recharts expects: `[{ name: 'root', children: [...] }]` usually.
                // Let's wrap it.
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
    }

    // Transform for Recharts
    const treeData = [
        {
            name: "Government Activity",
            children: data.map(item => ({ name: item.name, size: item.value }))
        }
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Government Activity by Ministry</h3>
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    width={400}
                    height={200}
                    data={treeData}
                    dataKey="size"
                    // @ts-ignore - Recharts 3.x typing issue with Treemap
                    ratio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                //   content={<CustomizedContent colors={COLORS} />}
                >
                    <Tooltip />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}
