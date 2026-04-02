"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CedarTreeProps {
    className?: string;
}

export function CedarTree({ className }: CedarTreeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { scrollYProgress } = useScroll({
        target: mounted ? containerRef : undefined,
        offset: ["start start", "end end"],
    });

    // Calculate distinct phases for the tree animation
    // 0.0 - 0.3: Canopy dominates
    // 0.3 - 0.7: Trunk dominates
    // 0.7 - 1.0: Roots dominate

    // Canopy animations (fade out as we scroll down)
    const canopyOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.2]);
    const canopyScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.8]);
    const canopyY = useTransform(scrollYProgress, [0, 0.4], [0, -100]);

    // Trunk animations (constant, but glowing)
    const trunkGlow = useTransform(
        scrollYProgress,
        [0.2, 0.5, 0.8],
        ["drop-shadow(0 0 2px rgba(16, 185, 129, 0.2))", "drop-shadow(0 0 15px rgba(16, 185, 129, 0.6))", "drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))"]
    );

    // Roots animations (fade in, glow, expand as we hit the bottom)
    const rootsOpacity = useTransform(scrollYProgress, [0.5, 0.8], [0.3, 1]);
    const rootsScale = useTransform(scrollYProgress, [0.6, 1], [0.8, 1.2]);
    const dataPointsGlow = useTransform(scrollYProgress, [0.7, 1], [0.2, 1]);

    if (!mounted) return null;

    return (
        <div ref={containerRef} className={cn("relative w-full h-[300vh]", className)}>
            {/* Sticky container that holds the SVG */}
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">

                {/* Abstract Background Glows */}
                <motion.div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]"
                    style={{ opacity: canopyOpacity }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-t-full blur-[150px]"
                    style={{ opacity: rootsOpacity }}
                />

                {/* The Tree SVG */}
                <svg
                    viewBox="0 0 1000 1200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full max-w-[800px] max-h-[90vh]"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* TRUNK - Constant anchor */}
                    <motion.path
                        d="M 480 400 Q 480 600 460 900 L 540 900 Q 520 600 520 400 Z"
                        fill="url(#trunkGradient)"
                        style={{ filter: trunkGlow }}
                        className="transition-all duration-300"
                    />

                    {/* CANOPY - Upper layers (Fades as we scroll) */}
                    <motion.g style={{ opacity: canopyOpacity, scale: canopyScale, y: canopyY, transformOrigin: "50% 20%" }}>
                        {/* Top tier */}
                        <path d="M 500 100 L 300 350 L 450 350 L 200 550 L 800 550 L 550 350 L 700 350 Z"
                            fill="url(#canopyGradientTop)"
                            className="drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />

                        {/* Middle tier */}
                        <path d="M 500 250 L 150 500 L 380 500 L 100 700 L 900 700 L 620 500 L 850 500 Z"
                            fill="url(#canopyGradientMid)"
                            className="opacity-90 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]" />

                        {/* Geometric accents in canopy */}
                        <polygon points="500,150 520,200 480,200" fill="#fff" className="opacity-40 blur-[1px]" />
                        <polygon points="400,380 430,420 370,420" fill="#fff" className="opacity-40 blur-[1px]" />
                        <polygon points="600,380 630,420 570,420" fill="#fff" className="opacity-40 blur-[1px]" />
                    </motion.g>

                    {/* ROOTS - Data Points (Brightens and expands at bottom) */}
                    <motion.g style={{ opacity: rootsOpacity, scale: rootsScale, transformOrigin: "50% 90%" }}>
                        {/* Main root structures */}
                        <path d="M 460 900 Q 300 950 150 1050 Q 250 1080 350 1000 Q 400 950 500 900"
                            stroke="url(#rootGradientLeft)" strokeWidth="4" fill="none" />
                        <path d="M 540 900 Q 700 950 850 1050 Q 750 1080 650 1000 Q 600 950 500 900"
                            stroke="url(#rootGradientRight)" strokeWidth="4" fill="none" />
                        <path d="M 480 900 Q 450 1000 400 1100" stroke="url(#rootGradientCenter)" strokeWidth="6" fill="none" />
                        <path d="M 520 900 Q 550 1000 600 1100" stroke="url(#rootGradientCenter)" strokeWidth="6" fill="none" />

                        {/* Secondary neural/data pathways */}
                        <path d="M 400 1000 Q 300 1100 200 1150" stroke="url(#rootGradientLeft)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                        <path d="M 600 1000 Q 700 1100 800 1150" stroke="url(#rootGradientRight)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                        <path d="M 450 1050 Q 500 1150 500 1200" stroke="url(#rootGradientCenter)" strokeWidth="2" fill="none" strokeDasharray="2 6" />

                        {/* Glowing Data Nodes */}
                        <DataNode cx={150} cy={1050} progress={dataPointsGlow} />
                        <DataNode cx={850} cy={1050} progress={dataPointsGlow} />
                        <DataNode cx={400} cy={1100} progress={dataPointsGlow} />
                        <DataNode cx={600} cy={1100} progress={dataPointsGlow} />
                        <DataNode cx={200} cy={1150} progress={dataPointsGlow} size={3} />
                        <DataNode cx={800} cy={1150} progress={dataPointsGlow} size={3} />
                        <DataNode cx={350} cy={1000} progress={dataPointsGlow} size={5} />
                        <DataNode cx={650} cy={1000} progress={dataPointsGlow} size={5} />
                        <DataNode cx={500} cy={1200} progress={dataPointsGlow} size={6} glowColor="rgba(59, 130, 246, " />
                    </motion.g>

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="trunkGradient" x1="460" y1="400" x2="540" y2="900">
                            <stop offset="0%" stopColor="#0f172a" />
                            <stop offset="50%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#020617" />
                        </linearGradient>

                        <linearGradient id="canopyGradientTop" x1="500" y1="100" x2="500" y2="550">
                            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
                            <stop offset="100%" stopColor="rgba(4, 120, 87, 0.2)" />
                        </linearGradient>

                        <linearGradient id="canopyGradientMid" x1="500" y1="250" x2="500" y2="700">
                            <stop offset="0%" stopColor="rgba(52, 211, 153, 0.6)" />
                            <stop offset="100%" stopColor="rgba(2, 44, 34, 0.4)" />
                        </linearGradient>

                        <linearGradient id="rootGradientLeft" x1="460" y1="900" x2="150" y2="1050">
                            <stop offset="0%" stopColor="rgba(30, 41, 59, 0.8)" />
                            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.5)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 1)" />
                        </linearGradient>

                        <linearGradient id="rootGradientRight" x1="540" y1="900" x2="850" y2="1050">
                            <stop offset="0%" stopColor="rgba(30, 41, 59, 0.8)" />
                            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.5)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 1)" />
                        </linearGradient>

                        <linearGradient id="rootGradientCenter" x1="500" y1="900" x2="500" y2="1200">
                            <stop offset="0%" stopColor="rgba(30, 41, 59, 1)" />
                            <stop offset="100%" stopColor="rgba(37, 99, 235, 1)" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

// Helper component for glowing data points in the roots
function DataNode({ cx, cy, progress, size = 4, glowColor = "rgba(14, 165, 233, " }: { cx: number, cy: number, progress: MotionValue<number>, size?: number, glowColor?: string }) {
    const nodeOpacity = useTransform(progress, [0, 1], [0.1, 1]);
    const nodeScale = useTransform(progress, [0, 1], [0.5, 1.5]);
    const filter = useTransform(progress, (v) => `drop-shadow(0 0 ${v * 15}px ${glowColor}${v * 0.8}))`);

    return (
        <motion.circle
            cx={cx}
            cy={cy}
            r={size}
            fill="#fff"
            style={{
                opacity: nodeOpacity,
                scale: nodeScale,
                filter: filter,
            }}
        />
    );
}
