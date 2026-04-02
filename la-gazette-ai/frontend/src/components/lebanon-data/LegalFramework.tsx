"use client";

import { motion } from "framer-motion";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip as RadarTooltip
} from "recharts";
import { Scale, ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function LegalFramework() {

    // ITU GCI Pillars (Out of 20 maximum score per pillar for Global Cybersecurity Index)
    const itugciData = [
        { subject: 'Legal Measures', lebanon: 12.08, regional: 18.5, fullMark: 20 },
        { subject: 'Technical Measures', lebanon: 4.5, regional: 15.2, fullMark: 20 },
        { subject: 'Organizational', lebanon: 6.2, regional: 14.8, fullMark: 20 },
        { subject: 'Capacity Bldg', lebanon: 5.5, regional: 16.0, fullMark: 20 },
        { subject: 'Cooperation', lebanon: 4.0, regional: 15.5, fullMark: 20 },
    ];

    const timelineEvents = [
        { year: '2017', title: 'Law 28: Access to Info', desc: 'Passed, amended in 2021. Obliges public bodies to publish data.', status: 'partial' },
        { year: '2018', title: 'Law 81: E-Transactions', desc: 'Recognises e-signatures & initial data protection. Lags global norms.', status: 'partial' },
        { year: '2019', title: 'Cybersecurity Strategy', desc: 'National strategy drafted, high-level commission established.', status: 'partial' },
        { year: '2024', title: 'Data Protection Authority', desc: 'Lebanon still lacks an independent DPA; courts remain the main avenue.', status: 'absent' },
    ];

    const getStatusIcon = (status: string) => {
        if (status === 'implemented') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (status === 'partial') return <AlertCircle className="w-5 h-5 text-amber-500" />;
        return <XCircle className="w-5 h-5 text-rose-500" />;
    };

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Legal Framework for the Digital Age</h2>
                <p className="text-slate-500 max-w-2xl">
                    While basic electronic transaction laws exist, outdated privacy frameworks and weak cybersecurity implementation leave citizens vulnerable.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Scale className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Digital Law Timeline</h3>
                    </div>

                    <div className="space-y-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                        {timelineEvents.map((event, idx) => (
                            <div key={idx} className="relative">
                                <span className="absolute -left-[27px] bg-white dark:bg-slate-900">
                                    {getStatusIcon(event.status)}
                                </span>
                                <div className="ml-4">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{event.year}</span>
                                    <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mt-1">{event.title}</h4>
                                    <p className="text-sm text-slate-500 mt-1">{event.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><AlertCircle className="w-4 h-4 text-amber-500" /> On Paper / Partial</div>
                        <div className="flex items-center gap-1"><XCircle className="w-4 h-4 text-rose-500" /> Absent / Failing</div>
                    </div>
                </motion.div>

                {/* ITU Cybersecurity Radar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-blue-100 dark:border-slate-800 flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-2 flex-grow-0">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Global Cybersecurity Index (ITI)</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Tier 4 ("Evolving"): Strengths in legal measures are undermined by technical and capacity deficits compared to regional peers.</p>

                    <div className="flex-grow w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={itugciData}>
                                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 20]} tick={false} axisLine={false} />
                                <Radar
                                    name="Lebanon"
                                    dataKey="lebanon"
                                    stroke="#ec4899" // Pink
                                    strokeWidth={2}
                                    fill="#ec4899"
                                    fillOpacity={0.4}
                                />
                                <Radar
                                    name="Regional Avg (Est.)"
                                    dataKey="regional"
                                    stroke="#3b82f6" // Blue
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    fill="transparent"
                                />
                                <RadarTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500 opacity-60"></div>
                            <span className="text-slate-600 dark:text-slate-400">Lebanon</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-blue-500 border-dashed"></div>
                            <span className="text-slate-600 dark:text-slate-400">Regional Benchmark</span>
                        </div>
                    </div>

                </motion.div>

            </div>
        </section>
    );
}
