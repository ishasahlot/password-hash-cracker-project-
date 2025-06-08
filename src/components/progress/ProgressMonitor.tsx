import React from 'react';
import { CrackingStats } from '../../lib/types';
import { Activity, Clock, Hash } from 'lucide-react';

interface ProgressMonitorProps {
  isRunning: boolean;
  progress: number;
  stats: CrackingStats;
}

export default function ProgressMonitor({ isRunning, progress, stats }: ProgressMonitorProps) {
  return (
    <div className="border dark:border-gray-700 border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 dark:text-white text-gray-900 flex items-center gap-2">
        <Activity className="h-5 w-5 text-purple-500" />
        Progress Monitor
      </h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-sm font-medium dark:text-gray-300 text-gray-700">
              {isRunning ? 'Cracking in progress...' : 'Ready to start'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {progress.toFixed(1)}%
            </div>
          </div>
          
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard 
            icon={<Hash className="h-4 w-4" />}
            label="Attempts" 
            value={stats.attempts.toLocaleString()}
          />
          <StatCard 
            icon={<Clock className="h-4 w-4" />}
            label="Elapsed Time" 
            value={formatTime(stats.elapsedTime)}
          />
          <StatCard 
            icon={<Activity className="h-4 w-4" />}
            label="Speed" 
            value={`${stats.hashesPerSecond.toLocaleString()} h/s`}
          />
        </div>
        
        {isRunning && (
          <div className="animate-pulse bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-sm p-2 rounded-md text-center">
            Web workers running in parallel...
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-medium dark:text-white text-gray-900">
        {value}
      </div>
    </div>
  );
}

function formatTime(milliseconds: number): string {
  if (milliseconds === 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
}