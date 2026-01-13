'use client';

import { useState, useEffect, useRef } from 'react';
import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { apiClient, DatabaseConnection } from '@/lib/api/client';
import {
    Database,
    CheckCircle,
    XCircle,
    Save,
    TestTube,
    Plus,
    Trash2,
    Download,
    Upload,
    Edit2,
    Check,
    X as XIcon
} from 'lucide-react';

interface SchemaInfo {
    schemaName: string;
    hasQuartzTables: boolean;
    quartzTables: string[];
}

export default function SettingsPage() {
    const {
        profiles,
        activeProfile,
        isLoaded,
        addProfile,
        updateProfile,
        deleteProfile,
        setActiveProfile,
        exportProfiles,
        importProfiles,
    } = useConnectionProfiles();

    const [formData, setFormData] = useState<DatabaseConnection>({
        host: 'localhost',
        port: 5432,
        database: '',
        username: '',
        password: '',
        schema: 'public',
        databaseType: 'postgresql',
    });

    const [profileName, setProfileName] = useState('');
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
    const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeProfile && isLoaded) {
            setFormData(activeProfile.connection);
            setProfileName(activeProfile.name);
            setEditingProfileId(activeProfile.id);
        } else {
            // Reset to defaults if no active profile
            setFormData({
                host: 'localhost',
                port: 5432,
                database: '',
                username: '',
                password: '',
                schema: 'public',
                databaseType: 'postgresql',
            });
            setProfileName('');
            setEditingProfileId(null);
        }
    }, [activeProfile, isLoaded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'port' ? parseInt(value) || 5432 : value,
        }));
    };

    const testConnection = async () => {
        setIsTestingConnection(true);
        setTestResult(null);
        setSchemas([]);

        try {
            const response = await apiClient.post('/api/database/test-connection', formData);

            if (response.data.success) {
                setTestResult({
                    success: true,
                    message: `Connection successful! Server version: ${response.data.serverVersion}`,
                });

                // Load schemas
                const schemasResponse = await apiClient.post('/api/database/schemas-with-quartz', {
                    connection: formData,
                });
                setSchemas(schemasResponse.data.schemas);
            } else {
                setTestResult({
                    success: false,
                    message: response.data.message,
                });
            }
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || error.message || 'Connection failed',
            });
        } finally {
            setIsTestingConnection(false);
        }
    };

    const saveProfile = async () => {
        if (!profileName.trim()) {
            alert('Please enter a profile name');
            return;
        }

        setIsSaving(true);
        try {
            // Validate Quartz tables
            const validation = await apiClient.post('/api/database/validate-quartz', {
                connection: formData,
                schema: formData.schema,
            });

            if (!validation.data.valid) {
                const proceed = window.confirm(
                    `Warning: Some Quartz tables are missing in schema "${formData.schema}":\n${validation.data.missingTables.join(', ')}\n\nDo you want to save anyway?`
                );
                if (!proceed) {
                    setIsSaving(false);
                    return;
                }
            }

            if (editingProfileId) {
                // Update existing profile
                updateProfile(editingProfileId, profileName, formData);
                alert('Profile updated successfully!');
            } else {
                // Add new profile
                addProfile(profileName, formData);
                alert('Profile saved successfully!');
            }

            // Clear form
            setTestResult(null);
            setSchemas([]);
        } catch (error: any) {
            alert(`Failed to save profile: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfileSelect = (profileId: string) => {
        setActiveProfile(profileId);
    };

    const handleDeleteProfile = (profileId: string) => {
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) return;

        if (window.confirm(`Are you sure you want to delete profile "${profile.name}"?`)) {
            deleteProfile(profileId);
        }
    };

    const handleNewProfile = () => {
        setFormData({
            host: 'localhost',
            port: 5432,
            database: '',
            username: '',
            password: '',
            schema: 'public',
            databaseType: 'postgresql',
        });
        setProfileName('');
        setEditingProfileId(null);
        setTestResult(null);
        setSchemas([]);
    };

    const handleExport = () => {
        const json = exportProfiles();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quartz-profiles-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const count = importProfiles(json);
                alert(`Successfully imported ${count} profile(s)`);
            } catch (error: any) {
                alert(`Import failed: ${error.message}`);
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Database Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your Quartz database connections
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Supported:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage-100 text-sage-300 dark:bg-sage-300 dark:text-sage-50">
                            PostgreSQL
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage-200 text-white dark:bg-sage-200 dark:text-sage-300">
                            SQL Server
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage-100/80 text-sage-300 dark:bg-sage-300/80 dark:text-sage-50">
                            MySQL
                        </span>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        disabled={profiles.length === 0}
                        className="bg-sage-200 hover:bg-sage-300 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <Download className="h-5 w-5" />
                        <span>Export</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-sage-300 hover:bg-[#6b7868] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <Upload className="h-5 w-5" />
                        <span>Import</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />

                    <button
                        onClick={handleNewProfile}
                        className="bg-sage-200 hover:bg-sage-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <Plus className="h-5 w-5" />
                        <span>New Profile</span>
                    </button>
                </div>
            </div>

            {/* Saved Profiles */}
            {profiles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Saved Profiles ({profiles.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profiles.map((profile) => (
                            <div
                                key={profile.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${activeProfile?.id === profile.id
                                    ? 'border-sage-200 bg-sage-50 dark:bg-sage-300/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-sage-200'
                                    }`}
                                onClick={() => handleProfileSelect(profile.id)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {profile.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                            {profile.connection.host}:{profile.connection.port}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            {profile.connection.database}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProfile(profile.id);
                                        }}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        title="Delete Profile"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                {activeProfile?.id === profile.id && (
                                    <div className="flex items-center text-xs text-sage-300 dark:text-sage-100 mt-2">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Connection Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    {editingProfileId ? 'Edit Profile' : 'New Profile'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Profile Name *
                        </label>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Production DB, Staging DB"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Host
                        </label>
                        <input
                            type="text"
                            name="host"
                            value={formData.host}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="localhost"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Port
                        </label>
                        <input
                            type="number"
                            name="port"
                            value={formData.port}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="5432"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Database Type
                        </label>
                        <select
                            name="databaseType"
                            value={formData.databaseType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="postgresql">PostgreSQL</option>
                            <option value="sqlserver">SQL Server</option>
                            <option value="mysql">MySQL</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Database
                        </label>
                        <input
                            type="text"
                            name="database"
                            value={formData.database}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="quartz_db"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="postgres"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Schema
                        </label>
                        {schemas.length > 0 ? (
                            <select
                                name="schema"
                                value={formData.schema}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                                {schemas.map(schema => (
                                    <option key={schema.schemaName} value={schema.schemaName}>
                                        {schema.schemaName} {schema.hasQuartzTables ? '✓ (Has Quartz tables)' : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                name="schema"
                                value={formData.schema || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="public"
                            />
                        )}
                    </div>
                </div>

                {testResult && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${testResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                        {testResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${testResult.success
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                            }`}>
                            {testResult.message}
                        </p>
                    </div>
                )}

                <div className="flex space-x-4">
                    <button
                        onClick={testConnection}
                        disabled={isTestingConnection}
                        className="flex-1 bg-sage-200 hover:bg-sage-300 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <TestTube className="h-5 w-5" />
                        <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                        onClick={saveProfile}
                        disabled={isSaving || !testResult?.success || !profileName.trim()}
                        className="flex-1 bg-sage-300 hover:bg-[#6b7868] disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <Save className="h-5 w-5" />
                        <span>{isSaving ? 'Saving...' : (editingProfileId ? 'Update Profile' : 'Save Profile')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
