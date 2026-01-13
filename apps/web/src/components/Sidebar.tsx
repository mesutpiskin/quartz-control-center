'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Home,
    Briefcase,
    Clock,
    Play,
    Settings,
    Database,
    Activity,
    Github,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Triggers', href: '/triggers', icon: Clock },
    { name: 'Executing', href: '/executing', icon: Play },
    { name: 'Scheduler Info', href: '/scheduler', icon: Activity },
    { name: 'Data View', href: '/database', icon: Database },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load collapse state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(savedState === 'true');
        }
    }, []);

    // Save collapse state to localStorage
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="flex flex-col flex-grow bg-gradient-to-b from-sage-300 to-[#5a6858] pt-5 pb-4 overflow-y-auto shadow-xl">
                    <div className="flex items-center flex-shrink-0 px-4 mb-8 justify-between">
                        <div className="flex items-center w-full px-2">
                            <Logo className="h-8 w-8 text-white flex-shrink-0" />
                            {!isCollapsed && (
                                <div className="ml-3 overflow-hidden">
                                    <h1 className="text-lg font-bold text-white leading-tight">
                                        Quartz
                                    </h1>
                                    <h2 className="text-xs font-medium text-sage-200 uppercase tracking-wider">
                                        Control Center
                                    </h2>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={toggleCollapse}
                            className="text-sage-100 hover:text-white transition-colors p-1 rounded hover:bg-sage-300/30"
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-5 w-5" />
                            ) : (
                                <ChevronLeft className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <nav className="mt-5 flex-1 px-2 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    group flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                                            ? 'bg-sage-200 text-sage-300 shadow-md'
                                            : 'text-sage-50 hover:bg-sage-300/30 hover:text-white'
                                        }
                  `}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon
                                        className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 ${isActive ? 'text-sage-300' : 'text-sage-100'
                                            }`}
                                    />
                                    {!isCollapsed && item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex-shrink-0 px-4 py-4 border-t border-sage-300/30">
                        <a
                            href="https://github.com/mesutpiskin/quartz-control-center"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} text-xs text-sage-100 hover:text-white transition-colors`}
                            title={isCollapsed ? 'View on GitHub' : undefined}
                        >
                            <Github className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                            {!isCollapsed && <span>View on GitHub</span>}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
