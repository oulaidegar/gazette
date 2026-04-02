"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

import { AuthProvider } from "@/components/auth/auth-provider";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <AuthProvider>
            <NextThemesProvider {...props}>{children}</NextThemesProvider>
        </AuthProvider>
    );
}
