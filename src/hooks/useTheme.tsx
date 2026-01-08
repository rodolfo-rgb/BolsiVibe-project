import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "bolsivibe-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(THEME_KEY) as Theme;
            if (stored) return stored;
        }
        return "system";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const root = window.document.documentElement;
        
        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add("dark");
                setResolvedTheme("dark");
            } else {
                root.classList.remove("dark");
                setResolvedTheme("light");
            }
        };

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            applyTheme(mediaQuery.matches);

            const handleChange = (e: MediaQueryListEvent) => {
                applyTheme(e.matches);
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        } else {
            applyTheme(theme === "dark");
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
