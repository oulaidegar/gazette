"use client";

import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { Wifi, Smartphone, Globe, Share2 } from "lucide-react";

export default function DigitalSociety() {

    // Social Media Platform Share Stacked Bar approximation
    const platformData = [
        {
            name: "Platform Share",
            Facebook: 45,
            Instagram: 35,
            YouTube: 15,
            Others: 5,
        }
    ];

    const platformColors = {
        Facebook: "#1877F2",
        Instagram: "#E4405F",
        YouTube: "#FF0000",
        Others: "#94a3b8"
    };

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Digital Society & Connectivity</h2>
                <p className="text-slate-500 max-w-2xl">
                    A highly connected society by regional standards, though plagued by fragile electricity and state control of ISPs.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Stats Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="lg:col-span-1 space-y-4 flex flex-col"
                >
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-900 dark:to-cyan-900 text-white shadow-md flex items-center justify-between group">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Internet Penetration</p>
                            <h3 className="text-4xl font-bold">90.1%</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Social Media Users</p>
                            <h3 className="text-4xl font-bold text-slate-900 dark:text-white">~4.5M</h3>
                            <p className="text-xs text-slate-400 mt-1">Out of 5.4M active population</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                            <Share2 className="w-6 h-6 text-pink-500" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Vulnerabilities</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Underinvested</h3>
                            <p className="text-xs text-slate-400 mt-1">Frequent outages & state ISP control</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Wifi className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Visual Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-full"
                >
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Social Media Landscape (2024 Market Share)</h3>
                        <p className="text-sm text-slate-500">
                            Meta platforms dominate the mobile social-media market, facilitating both massive connectivity and rapid spread of misinformation without robust local data protections.
                        </p>
                    </div>

                    <div className="flex-grow min-h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={platformData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                maxBarSize={60}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value}%`, 'Share']}
                                />
                                <Legend verticalAlign="top" height={40} iconType="circle" />

                                <Bar dataKey="Facebook" stackId="a" fill={platformColors.Facebook} radius={[10, 0, 0, 10]} />
                                <Bar dataKey="Instagram" stackId="a" fill={platformColors.Instagram} />
                                <Bar dataKey="YouTube" stackId="a" fill={platformColors.YouTube} />
                                <Bar dataKey="Others" stackId="a" fill={platformColors.Others} radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl">
                        <strong className="text-slate-700 dark:text-slate-300">Digital Payments Growth:</strong> Digital Watch highlights strong use of digital payments and remittances in Lebanon, with a growing ecosystem of mobile wallets acting as lifelines amid the banking sector collapse.
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
