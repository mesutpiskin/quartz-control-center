'use client';

import { useState, useEffect } from 'react';
import { DatabaseConnection } from '@/lib/api/client';
import { ConnectionProfile, ProfilesData } from '@/lib/types/profiles';

const PROFILES_KEY = 'quartz_db_profiles';
const ACTIVE_PROFILE_KEY = 'quartz_active_profile_id';

export const useConnectionProfiles = () => {
    const [profilesData, setProfilesData] = useState<ProfilesData>({
        profiles: [],
        activeProfileId: null,
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load profiles from localStorage
    const loadProfiles = () => {
        try {
            const stored = localStorage.getItem(PROFILES_KEY);
            const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);

            if (stored) {
                const profiles: ConnectionProfile[] = JSON.parse(stored);
                setProfilesData({
                    profiles,
                    activeProfileId: activeId,
                });
            }
        } catch (error) {
            console.error('Failed to load profiles:', error);
        }
    };

    useEffect(() => {
        loadProfiles();
        setIsLoaded(true);

        // Listen for storage events
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === PROFILES_KEY || e.key === ACTIVE_PROFILE_KEY) {
                loadProfiles();
            }
        };

        // Listen for custom events
        const handleProfilesUpdate = () => {
            loadProfiles();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profilesUpdated', handleProfilesUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profilesUpdated', handleProfilesUpdate);
        };
    }, []);

    const saveProfiles = (data: ProfilesData) => {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(data.profiles));
        if (data.activeProfileId) {
            localStorage.setItem(ACTIVE_PROFILE_KEY, data.activeProfileId);
        } else {
            localStorage.removeItem(ACTIVE_PROFILE_KEY);
        }
        setProfilesData(data);
        window.dispatchEvent(new Event('profilesUpdated'));
        // Also dispatch connectionUpdated for backward compatibility
        const activeProfile = data.profiles.find(p => p.id === data.activeProfileId);
        window.dispatchEvent(new CustomEvent('connectionUpdated', {
            detail: activeProfile?.connection || null
        }));
    };

    const addProfile = (name: string, connection: DatabaseConnection): ConnectionProfile => {
        const newProfile: ConnectionProfile = {
            id: Date.now().toString(),
            name,
            connection,
            createdAt: new Date().toISOString(),
        };

        const newData: ProfilesData = {
            profiles: [...profilesData.profiles, newProfile],
            activeProfileId: newProfile.id,
        };

        saveProfiles(newData);
        return newProfile;
    };

    const updateProfile = (id: string, name: string, connection: DatabaseConnection) => {
        const newData: ProfilesData = {
            ...profilesData,
            profiles: profilesData.profiles.map(p =>
                p.id === id ? { ...p, name, connection } : p
            ),
        };

        saveProfiles(newData);
    };

    const deleteProfile = (id: string) => {
        const newProfiles = profilesData.profiles.filter(p => p.id !== id);
        const newActiveId = profilesData.activeProfileId === id
            ? (newProfiles.length > 0 ? newProfiles[0].id : null)
            : profilesData.activeProfileId;

        saveProfiles({
            profiles: newProfiles,
            activeProfileId: newActiveId,
        });
    };

    const setActiveProfile = (id: string) => {
        const profile = profilesData.profiles.find(p => p.id === id);
        if (!profile) return;

        const updatedProfiles = profilesData.profiles.map(p =>
            p.id === id ? { ...p, lastUsed: new Date().toISOString() } : p
        );

        saveProfiles({
            profiles: updatedProfiles,
            activeProfileId: id,
        });
    };

    const exportProfiles = (): string => {
        return JSON.stringify(profilesData.profiles, null, 2);
    };

    const importProfiles = (jsonString: string): number => {
        try {
            const imported: ConnectionProfile[] = JSON.parse(jsonString);

            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected array of profiles');
            }

            // Validate structure
            imported.forEach((profile, index) => {
                if (!profile.id || !profile.name || !profile.connection) {
                    throw new Error(`Invalid profile at index ${index}`);
                }
            });

            // Merge with existing profiles (avoid duplicates by ID)
            const existingIds = new Set(profilesData.profiles.map(p => p.id));
            const newProfiles = imported.filter(p => !existingIds.has(p.id));

            const mergedProfiles = [...profilesData.profiles, ...newProfiles];

            saveProfiles({
                profiles: mergedProfiles,
                activeProfileId: profilesData.activeProfileId || (mergedProfiles.length > 0 ? mergedProfiles[0].id : null),
            });

            return newProfiles.length;
        } catch (error) {
            throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const activeProfile = profilesData.profiles.find(p => p.id === profilesData.activeProfileId);
    const connection = activeProfile?.connection || null;
    const hasConnection = !!connection;

    return {
        profiles: profilesData.profiles,
        activeProfile,
        connection,
        hasConnection,
        isLoaded,
        addProfile,
        updateProfile,
        deleteProfile,
        setActiveProfile,
        exportProfiles,
        importProfiles,
    };
};
