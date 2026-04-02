"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export default function ExecutiveOverview() {
    const ageData = [
        { name: "Under 15", value: 25 },
        { name: "15-64 (Working Age)", value: 65 }, // Approximate
        { name: "65 and over", value: 10 },        // Approximate
    ];

    const COLORS = ['#8b5cf6', '#3b82f6', '#14b8a6'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <section className="space-y-8 relative">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Executive Overview</h2>
                <p className="text-slate-500 max-w-2xl">
                    Lebanon is a small, densely populated country facing a severe economic crisis alongside high levels of human development.
                </p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Stat Cards */}
                <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <Users className="w-5 h-5 text-purple-500" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">2023-2025</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Population</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">5.8M</h3>
                    <p className="text-xs text-slate-400 mt-2">Highly urbanized (89%)</p>
                </motion.div>

                <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">Rank: 102/193</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Human Development Index</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">0.752</h3>
                    <p className="text-xs text-slate-400 mt-2">"High" category, 10th in Arab states</p>
                </motion.div>

                <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Fallen Sharply</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">GDP per capita</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">$4,757</h3>
                    <p className="text-xs text-slate-400 mt-2">Total GDP ~27.5B USD</p>
                </motion.div>

                <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <Activity className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Monetary: 44%</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Multidimensional Poverty</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">73%</h3>
                    <p className="text-xs text-slate-400 mt-2">Of Lebanese residents</p>
                </motion.div>
            </motion.div>

            {/* Age Structure Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Age Structure</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md">
                        The population remains heavily skewed young, creating immense pressure on jobs, housing, and infrastructure amidst the economic collapse.
                    </p>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ageData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {ageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-900 dark:to-blue-900 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Demographic Paradox</h3>
                        <p className="text-purple-100 text-sm leading-relaxed">
                            Despite the economic collapse, human capital metrics display resilience. Life expectancy holds at ~77 years, and mean years of schooling exceeds 10 years.
                        </p>
                    </div>
                    <div className="mt-8">
                        <div className="text-4xl font-bold mb-1">89%</div>
                        <div className="text-sm text-purple-200 uppercase tracking-wider font-semibold">Urbanization Rate</div>
                    </div>
                </div>
            </motion.div>

        </section>
    );
}
