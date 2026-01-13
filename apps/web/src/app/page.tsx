'use client';

import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Database, Briefcase, Clock, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { hasConnection, isLoaded, connection } = useConnectionProfiles();
  const router = useRouter();
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadStatistics = async () => {
    if (!connection) return;

    setIsLoadingStats(true);
    try {
      const { apiClient, withConnection } = await import('@/lib/api/client');
      const response = await apiClient.post(
        '/api/scheduler/statistics',
        withConnection(connection, {})
      );
      setStatistics(response.data.statistics);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isLoaded && !hasConnection) {
      router.push('/settings');
    }
  }, [hasConnection, isLoaded, router]);

  // Load statistics on mount and when connection changes
  useEffect(() => {
    if (hasConnection && connection) {
      loadStatistics();
    }
  }, [hasConnection, connection]);

  // Auto-refresh statistics every 5 seconds
  useEffect(() => {
    if (!hasConnection || !connection) return;

    const interval = setInterval(() => {
      loadStatistics();
    }, 5000);

    return () => clearInterval(interval);
  }, [hasConnection, connection]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-200 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Quartz Control Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your Quartz Scheduler jobs, triggers, and monitor execution in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <DashboardCard
          title="Jobs"
          description="View and manage scheduled jobs"
          icon={Briefcase}
          href="/jobs"
          color="blue"
        />
        <DashboardCard
          title="Triggers"
          description="Configure job triggers and schedules"
          icon={Clock}
          href="/triggers"
          color="purple"
        />
        <DashboardCard
          title="Executing"
          description="Monitor currently running jobs"
          icon={Activity}
          href="/executing"
          color="green"
        />
        <DashboardCard
          title="Scheduler Info"
          description="View scheduler statistics"
          icon={Database}
          href="/scheduler"
          color="orange"
        />
      </div>

      {/* Statistics Section */}
      {hasConnection && statistics && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Jobs"
              value={statistics.totalJobs}
              icon={Briefcase}
              color="blue"
              isLoading={isLoadingStats}
            />
            <StatCard
              label="Running Jobs"
              value={statistics.executingJobs}
              icon={Activity}
              color="green"
              isLoading={isLoadingStats}
              pulse={statistics.executingJobs > 0}
            />
            <StatCard
              label="Total Triggers"
              value={statistics.totalTriggers}
              icon={Clock}
              color="purple"
              isLoading={isLoadingStats}
            />
            <StatCard
              label="Paused Triggers"
              value={statistics.pausedTriggers}
              icon={Clock}
              color="orange"
              isLoading={isLoadingStats}
            />
            <StatCard
              label="Scheduler Instances"
              value={statistics.schedulerInstances}
              icon={Database}
              color="indigo"
              isLoading={isLoadingStats}
            />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-sage-200 to-sage-300 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3">
              Getting Started
            </h2>
            <p className="text-sage-50 mb-6 max-w-2xl">
              Connect to your existing Quartz database and start managing your scheduled jobs.
              The control center provides a comprehensive view of all your jobs, triggers, and execution history.
            </p>
            <div className="space-y-3">
              <FeatureItem text="Real-time job monitoring" />
              <FeatureItem text="Pause, resume, and trigger jobs manually" />
              <FeatureItem text="View cron expressions and schedules" />
              <FeatureItem text="Monitor scheduler cluster information" />
            </div>
          </div>
          <div className="hidden lg:block">
            <Database className="h-32 w-32 text-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  color
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  }[color];

  return (
    <Link href={href}>
      <div className={`bg-gradient-to-br ${colorClasses} rounded-xl shadow-lg p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group h-full`}>
        <Icon className="h-10 w-10 mb-4 opacity-90" />
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/80 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
          View <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
      <span className="text-sage-50">{text}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  isLoading,
  pulse = false
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  isLoading?: boolean;
  pulse?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
  }[color];

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses} transition-all duration-300 ${pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-8 w-8" />
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <span className="text-3xl font-bold">{value}</span>
        )}
      </div>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </div>
  );
}
