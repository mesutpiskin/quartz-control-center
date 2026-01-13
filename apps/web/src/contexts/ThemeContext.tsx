'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    effectiveTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    // Get system preference
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    };

    // Calculate effective theme based on current theme setting
    const calculateEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
        if (currentTheme === 'system') {
            return getSystemTheme();
        }
        return currentTheme;
    };

    // Apply theme to DOM
    const applyTheme = (newEffectiveTheme: 'light' | 'dark') => {
        const root = document.documentElement;
        if (newEffectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    // Initialize theme from localStorage or system
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const initialTheme = savedTheme || 'system';
        setThemeState(initialTheme);
        
        const effective = calculateEffectiveTheme(initialTheme);
        setEffectiveTheme(effective);
        applyTheme(effective);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newEffective = e.matches ? 'dark' : 'light';
            setEffectiveTheme(newEffective);
            applyTheme(newEffective);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        
        const newEffective = calculateEffectiveTheme(newTheme);
        setEffectiveTheme(newEffective);
        applyTheme(newEffective);
    };

    const toggleTheme = () => {
        const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
