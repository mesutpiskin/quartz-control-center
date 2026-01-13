'use client';

import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle, XCircle, Sun, Moon } from 'lucide-react';

export function Header() {
    const { activeProfile, hasConnection } = useConnectionProfiles();
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

                    {hasConnection && activeProfile ? (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <div className="text-sm">
                                <p className="font-medium text-green-900 dark:text-green-100">
                                    {activeProfile.name}
                                </p>
                                <p className="text-green-700 dark:text-green-300">
                                    {activeProfile.connection.host}:{activeProfile.connection.port}/{activeProfile.connection.database}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <div className="text-sm">
                                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                                    Not Connected
                                </p>
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    Configure in Settings
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
