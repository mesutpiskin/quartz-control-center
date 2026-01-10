'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Briefcase,
    Clock,
    Play,
    Settings,
    Database,
    Activity,
    Github
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Triggers', href: '/triggers', icon: Clock },
    { name: 'Executing', href: '/executing', icon: Play },
    { name: 'Scheduler Info', href: '/scheduler', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-900 to-indigo-800 pt-5 pb-4 overflow-y-auto shadow-xl">
                    <div className="flex items-center flex-shrink-0 px-4 mb-8">
                        <Database className="h-8 w-8 text-indigo-300" />
                        <h1 className="ml-3 text-xl font-bold text-white">
                            Quartz Control
                        </h1>
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
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                                            ? 'bg-indigo-700 text-white shadow-md'
                                            : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon
                                        className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-indigo-300'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex-shrink-0 px-4 py-4 border-t border-indigo-700 space-y-2">
                        <a
                            href="https://github.com/mesutpiskin/quartz-control-center"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-xs text-indigo-300 hover:text-white transition-colors"
                        >
                            <Github className="h-4 w-4 mr-2" />
                            <span>View on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
