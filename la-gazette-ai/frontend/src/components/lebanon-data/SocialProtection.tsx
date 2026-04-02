"use client";

import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CircleDollarSign, Layers } from "lucide-react";

export default function SocialProtection() {

    // Poverty Rates %
    const povertyData = [
        {
            name: "Poverty Rates",
            "Lebanese (Monetary)": 44,
            "Lebanese (Multidimensional)": 73,
            "Non-Lebanese (Multidimensional)": 98 // Approximate "nearly all"
        }
    ];

    const timelineEvents = [
        { text: 'Targeting System', desc: 'NPTP reaches the poorest 20%, but relies heavily on means-testing.', active: true },
        { text: 'Emergency Safety Net', desc: 'ESSN rolled out alongside intl partners, leaving many vulnerable uncovered.', active: true },
        { text: 'Disability Allowance', desc: 'Introduced in 2024 under new Social Protection Strategy.', active: true },
        { text: 'Contributory Pension', desc: 'Reforms introduced in 2024 aim to replace end-of-service indemnities.', active: false },
    ];

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Social Protection, Poverty & Inequality</h2>
                <p className="text-slate-500 max-w-2xl">
                    With poverty rates tripling over a decade and massive structural inequality, the country relies on fragmented safety nets targeting roughly 20% of the population.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Poverty Stacked Bar Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Poverty Breadth (World Bank 2024)</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6 flex-grow-0">
                        Multidimensional poverty includes deficits in electricity, healthcare, and education alongside income loss.
                    </p>

                    <div className="h-[250px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={povertyData}
                                margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                                barSize={40}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value}%`, 'Population Share']}
                                />
                                <Legend verticalAlign="top" height={60} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />

                                <Bar dataKey="Lebanese (Monetary)" fill="#f59e0b" radius={[4, 4, 4, 4]} />
                                <Bar dataKey="Lebanese (Multidimensional)" fill="#6366f1" radius={[4, 4, 4, 4]} />
                                <Bar dataKey="Non-Lebanese (Multidimensional)" fill="#ef4444" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Social Protection Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-800/20 flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <CircleDollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Social Protection Measures</h3>
                    </div>

                    <div className="space-y-4 flex-grow">
                        {timelineEvents.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.active ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.text}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                        * Implementation of the 2024 National Social Protection Strategy depends heavily on future fiscal space and governance reforms.
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
