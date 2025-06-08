import React from 'react';
import { AttackMode, HashAlgorithm } from '../../lib/types';
import { Settings, Key, BookOpen, Zap } from 'lucide-react';

interface AttackConfigProps {
  selectedAttack: AttackMode;
  onAttackChange: (mode: AttackMode) => void;
  selectedAlgorithm: HashAlgorithm;
  onAlgorithmChange: (algorithm: HashAlgorithm) => void;
  disabled: boolean;
}

export default function AttackConfig({
  selectedAttack,
  onAttackChange,
  selectedAlgorithm,
  onAlgorithmChange,
  disabled
}: AttackConfigProps) {
  const attackModes: { id: AttackMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'dictionary',
      label: 'Dictionary',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Uses common passwords and applies mutations'
    },
    {
      id: 'bruteforce',
      label: 'Brute Force',
      icon: <Zap className="h-5 w-5" />,
      description: 'Tries all possible character combinations'
    },
    {
      id: 'hybrid',
      label: 'Hybrid',
      icon: <Settings className="h-5 w-5" />,
      description: 'Combines dictionary words with brute force elements'
    }
  ];

  const hashAlgorithms: { id: HashAlgorithm; label: string }[] = [
    { id: 'md5', label: 'MD5' },
    { id: 'sha1', label: 'SHA-1' },
    { id: 'sha256', label: 'SHA-256' }
  ];

  return (
    <div className="border dark:border-gray-700 border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold dark:text-white text-gray-900">Attack Configuration</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
            Hash Algorithm
          </h3>
          <div className="flex gap-2 flex-wrap">
            {hashAlgorithms.map(algo => (
              <button
                key={algo.id}
                onClick={() => onAlgorithmChange(algo.id)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedAlgorithm === algo.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } border ${
                  selectedAlgorithm === algo.id
                    ? 'border-purple-200 dark:border-purple-800'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                {algo.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
            Attack Mode
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {attackModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => onAttackChange(mode.id)}
                disabled={disabled}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  selectedAttack === mode.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 ring-1 ring-purple-500'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                } border`}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  selectedAttack === mode.id
                    ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {mode.icon}
                </div>
                <span className={`font-medium ${
                  selectedAttack === mode.id
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {mode.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {mode.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedAttack === 'dictionary' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Dictionary attack uses a list of common passwords and applies mutations like character substitutions and adding numbers/symbols.
            </p>
          </div>
        )}
        
        {selectedAttack === 'bruteforce' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Brute force tries all possible character combinations. For demonstration purposes, this is limited to shorter passwords.
            </p>
          </div>
        )}
        
        {selectedAttack === 'hybrid' && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hybrid attack combines dictionary words with numbers, symbols, and other patterns commonly used in passwords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}