import React, { useState } from 'react';
import HashInput from '../hash/HashInput';
import AttackConfig from '../attack/AttackConfig';
import ProgressMonitor from '../progress/ProgressMonitor';
import ResultsDisplay from '../results/ResultsDisplay';
import { Hash, AttackMode, HashAlgorithm } from '../../lib/types';
import { usePasswordCracker } from '../../hooks/usePasswordCracker';

export default function Dashboard() {
  const [hashes, setHashes] = useState<Hash[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<AttackMode>('dictionary');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<HashAlgorithm>('md5');
  
  const { 
    startCracking, 
    stopCracking, 
    isRunning, 
    progress, 
    crackedHashes, 
    stats 
  } = usePasswordCracker();

  const handleStartCracking = () => {
    if (hashes.length === 0) return;
    
    startCracking({
      hashes,
      attackMode: selectedAttack,
      algorithm: selectedAlgorithm,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <HashInput 
            onHashesChange={setHashes} 
            disabled={isRunning}
            algorithm={selectedAlgorithm}
          />
          
          <AttackConfig 
            selectedAttack={selectedAttack}
            onAttackChange={setSelectedAttack}
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            disabled={isRunning}
          />
          
          <div className="flex justify-center gap-4">
            <button
              onClick={handleStartCracking}
              disabled={isRunning || hashes.length === 0}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md transition-colors duration-200 font-medium"
            >
              Start Cracking
            </button>
            
            {isRunning && (
              <button
                onClick={stopCracking}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium"
              >
                Stop
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <ProgressMonitor 
            isRunning={isRunning} 
            progress={progress}
            stats={stats}
          />
          
          <ResultsDisplay 
            crackedHashes={crackedHashes} 
            totalHashes={hashes.length}
          />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Educational Notice</h3>
        <p className="mt-1 text-yellow-700 dark:text-yellow-300">
          This tool is for educational purposes only. It demonstrates password vulnerability and cracking techniques to raise awareness about secure authentication practices. Using this knowledge to access accounts without authorization is illegal and unethical.
        </p>
      </div>
    </div>
  );
}