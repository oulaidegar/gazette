"use client";

import { motion } from "framer-motion";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Leaf, Droplets, ThermometerSun, AlertOctagon } from "lucide-react";

export default function EnvironmentClimate() {

    // Environmental Performance Index 2024 (EPI)
    const epiData = [
        { subject: 'Fisheries', score: 96.2 },
        { subject: 'EPI Overall', score: 39.9 },
        { subject: 'Air Quality', score: 45.0 }, // Estimate based on reports
        { subject: 'Water & San', score: 42.0 }, // Estimate
        { subject: 'Climate & Energy', score: 38.0 }, // Estimate
        { subject: 'Ecosystem Vitality', score: 23.6 },
    ];

    // GHG Emissions / Forecasts (MtCO2e) roughly tracking 2019-2022 contraction
    const ghgData = [
        { year: '2018', emissions: 30.1 },
        { year: '2019', emissions: 29.5 },
        { year: '2020', emissions: 25.2 },
        { year: '2021', emissions: 24.4 },
        { year: '2022', emissions: 20.5 },
    ];

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Environment, Ecology & Climate</h2>
                <p className="text-slate-500 max-w-2xl">
                    Severe vulnerabilities in biodiversity and waste management intersect with rising climate risks, despite a recent drop in emissions driven by economic contraction.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* EPI Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Environmental Performance Index (EPI 2024)</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 flex-grow-0">
                        Ranked 126th of 180. Exceptionally strong in fisheries due to localized management, but critically weak in ecosystem vitality and habitat protection.
                    </p>

                    <div className="h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={epiData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} interval={0} angle={-30} textAnchor="end" />
                                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="score" name="EPI Score (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Climate Risk & Emissions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <ThermometerSun className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">GHG Emissions Contraction & Vulnerability</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 flex-grow-0">
                        Emissions dropped ~32% since 2019 due to the economic crisis. However, long-term climate vulnerability remains acute.
                    </p>

                    <div className="h-[200px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ghgData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    name="Total GHG Emissions (MtCO2e)"
                                    dataKey="emissions"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#ec4899' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-start">
                            <Droplets className="w-5 h-5 text-blue-500 mb-2" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white mb-1">-29%</span>
                            <span className="text-xs text-slate-500 font-medium">Projected Water Drop by 2080</span>
                        </div>
                        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 flex flex-col items-start">
                            <AlertOctagon className="w-5 h-5 text-orange-500 mb-2" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white mb-1">Rank 49/191</span>
                            <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">INFORM Risk Index (Hazards)</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
