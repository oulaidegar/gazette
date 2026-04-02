import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "dark" | "light" | "glow";
    blur?: "sm" | "md" | "lg" | "xl";
}

export function GlassCard({
    children,
    className,
    variant = "default",
    blur = "md",
    ...props
}: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border transition-all duration-300",
                {
                    "bg-white/10 border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]": variant === "default",
                    "bg-black/20 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]": variant === "dark",
                    "bg-white/20 border-white/30 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]": variant === "light",
                    "bg-blue-500/10 border-blue-400/30 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]": variant === "glow",
                },
                {
                    "backdrop-blur-sm": blur === "sm",
                    "backdrop-blur-md": blur === "md",
                    "backdrop-blur-lg": blur === "lg",
                    "backdrop-blur-xl": blur === "xl",
                },
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
