import { DatabaseConnection } from '../api/client';

export interface ConnectionProfile {
    id: string;
    name: string;
    connection: DatabaseConnection;
    createdAt: string;
    lastUsed?: string;
}

export interface ProfilesData {
    profiles: ConnectionProfile[];
    activeProfileId: string | null;
}
