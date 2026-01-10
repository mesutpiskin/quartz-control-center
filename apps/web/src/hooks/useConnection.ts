'use client';

import { useState, useEffect } from 'react';
import { DatabaseConnection } from '@/lib/api/client';

const CONNECTION_KEY = 'quartz_db_connection';

export const useConnection = () => {
    const [connection, setConnectionState] = useState<DatabaseConnection | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load connection from localStorage on mount
        const loadConnection = () => {
            const stored = localStorage.getItem(CONNECTION_KEY);
            if (stored) {
                try {
                    setConnectionState(JSON.parse(stored));
                } catch (error) {
                    console.error('Failed to parse stored connection:', error);
                }
            }
        };

        loadConnection();
        setIsLoaded(true);

        // Listen for storage events to sync across tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === CONNECTION_KEY) {
                if (e.newValue) {
                    try {
                        setConnectionState(JSON.parse(e.newValue));
                    } catch (error) {
                        console.error('Failed to parse connection from storage event:', error);
                    }
                } else {
                    setConnectionState(null);
                }
            }
        };

        // Listen for custom event for same-window updates
        const handleConnectionUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<DatabaseConnection | null>;
            setConnectionState(customEvent.detail);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('connectionUpdated', handleConnectionUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('connectionUpdated', handleConnectionUpdate);
        };
    }, []);

    const setConnection = (conn: DatabaseConnection | null) => {
        if (conn) {
            localStorage.setItem(CONNECTION_KEY, JSON.stringify(conn));
        } else {
            localStorage.removeItem(CONNECTION_KEY);
        }
        setConnectionState(conn);

        // Dispatch custom event to notify other components in the same window
        window.dispatchEvent(new CustomEvent('connectionUpdated', { detail: conn }));
    };

    const clearConnection = () => {
        localStorage.removeItem(CONNECTION_KEY);
        setConnectionState(null);
        window.dispatchEvent(new CustomEvent('connectionUpdated', { detail: null }));
    };

    const hasConnection = !!connection;

    return {
        connection,
        setConnection,
        clearConnection,
        hasConnection,
        isLoaded,
    };
};
