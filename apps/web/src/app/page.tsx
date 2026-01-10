'use client';

import { useConnectionProfiles } from '@/hooks/useConnectionProfiles';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Database, Briefcase, Clock, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { hasConnection, isLoaded } = useConnectionProfiles();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !hasConnection) {
      router.push('/settings');
    }
  }, [hasConnection, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3">
              Getting Started
            </h2>
            <p className="text-indigo-100 mb-6 max-w-2xl">
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
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
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
      <span className="text-indigo-100">{text}</span>
    </div>
  );
}
