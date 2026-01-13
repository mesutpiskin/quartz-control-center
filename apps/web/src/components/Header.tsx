'use client';

import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Database } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    const { activeProfile } = useConnectionProfiles();
    const { effectiveTheme, toggleTheme } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Quartz Control Center
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage your scheduler jobs with ease
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {effectiveTheme === 'dark' ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <Moon className="h-5 w-5 text-sage-200" />
                        )}
                    </button>

                    {/* Profile Name - Click to Settings */}
                    {activeProfile && (
                        <Link
                            href="/settings"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                            title="Click to manage database connections"
                        >
                            <Database className="h-5 w-5 text-sage-300 group-hover:text-sage-200" />
                            <div className="text-sm">
                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-sage-300">
                                    {activeProfile.name}
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
