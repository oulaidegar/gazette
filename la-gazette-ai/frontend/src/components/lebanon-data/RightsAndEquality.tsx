"use client";

import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Check, X, AlertTriangle, Info } from "lucide-react";

export default function RightsAndEquality() {

    // Women, Business and the Law Index (World Bank - max 100)
    const wblData = [
        { category: 'Mobility', lebanon: 100, globalAvg: 80 },
        { category: 'Workplace', lebanon: 100, globalAvg: 78 },
        { category: 'Entrepreneurship', lebanon: 75, globalAvg: 60 },
        { category: 'Marriage', lebanon: 60, globalAvg: 70 },
        { category: 'Pay', lebanon: 50, globalAvg: 65 },
        { category: 'Assets', lebanon: 40, globalAvg: 65 },
        { category: 'Pension', lebanon: 25, globalAvg: 55 },
        { category: 'Parenthood', lebanon: 20, globalAvg: 45 },
    ];

    const lgbtqStatus = [
        { label: "Criminalisation of Same-Sex Conduct", status: "partial", note: "Art 534 penalises 'unnatural' sex, but courts have ruled otherwise." },
        { label: "Anti-Discrimination Laws", status: "absent", note: "No protections based on sexual orientation or gender identity." },
        { label: "Legal Gender Recognition", status: "absent", note: "De facto targeting of trans people's gender expression." },
        { label: "Partnership Recognition", status: "absent", note: "No recognition of same-sex unions or family rights." },
    ];

    const getTrafficIcon = (status: string) => {
        if (status === 'full') return <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>;
        if (status === 'partial') return <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>;
        return <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>;
    };

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Rights, Gender Equality & LGBTQ+</h2>
                <p className="text-slate-500 max-w-2xl">
                    Structural discrimination governed by religious personal-status laws impedes gender equality, while LGBTQ+ individuals face ambiguous legal standing and growing backlash.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Women's Rights Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Women, Business and the Law (2024 Index)</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Lebanon scores 100 on mobility and workplace rights, but falls drastically in family law domains like parenthood (20), pension (25), and assets (40).
                    </p>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={wblData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="category" type="category" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

                                <Bar dataKey="lebanon" name="Lebanon Score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                                <Bar dataKey="globalAvg" name="Global Average" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* LGBTQ Status Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">LGBTQ+ Legal Status "Traffic Light"</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        A tension exists between the judiciary (reinterpreting penal codes) and legislature (drafting new bans).
                    </p>

                    <div className="space-y-4 flex-grow">
                        {lgbtqStatus.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <div className="mt-1">
                                    {getTrafficIcon(item.status)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 flex items-start gap-3">
                        <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-purple-800 dark:text-purple-200">
                            <strong>Jurisprudential Resistance:</strong> Between 2007 and 2018, several lower courts ruled that consensual same‑sex relations are not "unnatural", culminating in a 2023 appeals‑court decision enforcing this protection, despite intense legislative backlash.
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
