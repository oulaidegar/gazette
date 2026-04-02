import type { Metadata } from "next";
import { Inter, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const arabic = Noto_Naskh_Arabic({
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-arabic"
});

export const metadata: Metadata = {
    title: "The Official Digital Lebanese Gazette",
    description: "Search the Lebanese Official Gazette with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn(inter.variable, arabic.variable)} suppressHydrationWarning>
            <body className={cn(inter.className, "min-h-screen bg-slate-50 antialiased selection:bg-blue-100 selection:text-blue-900")}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
