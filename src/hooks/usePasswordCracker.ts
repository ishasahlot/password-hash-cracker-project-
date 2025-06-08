import { useState, useEffect, useRef } from 'react';
import { Hash, CrackingOptions, CrackingStats, CrackedResult } from '../lib/types';

const initialStats: CrackingStats = {
  attempts: 0,
  elapsedTime: 0,
  hashesPerSecond: 0
};

export function usePasswordCracker() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crackedHashes, setCrackedHashes] = useState<Hash[]>([]);
  const [stats, setStats] = useState<CrackingStats>(initialStats);
  
  // References to workers
  const dictionaryWorkerRef = useRef<Worker | null>(null);
  const bruteForceWorkerRef = useRef<Worker | null>(null);
  const hybridWorkerRef = useRef<Worker | null>(null);
  
  // Keep track of the current options
  const optionsRef = useRef<CrackingOptions | null>(null);
  
  // Cleanup function for workers
  const cleanupWorkers = () => {
    [dictionaryWorkerRef, bruteForceWorkerRef, hybridWorkerRef].forEach(workerRef => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    });
  };
  
  // Initialize workers
  useEffect(() => {
    return () => {
      cleanupWorkers();
    };
  }, []);
  
  // Function to initialize the appropriate worker based on attack mode
  const initializeWorker = (options: CrackingOptions) => {
    cleanupWorkers();
    
    try {
      let worker: Worker;
      
      switch (options.attackMode) {
        case 'dictionary':
          worker = new Worker(new URL('../lib/workers/dictionaryAttack.worker.ts', import.meta.url), { type: 'module' });
          dictionaryWorkerRef.current = worker;
          break;
        case 'bruteforce':
          worker = new Worker(new URL('../lib/workers/bruteForceAttack.worker.ts', import.meta.url), { type: 'module' });
          bruteForceWorkerRef.current = worker;
          break;
        case 'hybrid':
          worker = new Worker(new URL('../lib/workers/hybridAttack.worker.ts', import.meta.url), { type: 'module' });
          hybridWorkerRef.current = worker;
          break;
        default:
          throw new Error(`Unsupported attack mode: ${options.attackMode}`);
      }
      
      // Set up common event handlers
      worker.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'progress':
            setProgress(data.progress);
            break;
          case 'result':
            handleCrackedPassword(data as CrackedResult);
            break;
          case 'stats':
            setStats(data);
            break;
        }
      };
      
      worker.onerror = (error) => {
        console.error('Worker error:', error);
        setIsRunning(false);
      };
      
      // Return the initialized worker
      return worker;
      
    } catch (error) {
      console.error('Error initializing worker:', error);
      return null;
    }
  };
  
  // Handle when a password is cracked
  const handleCrackedPassword = (result: CrackedResult) => {
    setCrackedHashes(prev => {
      // Check if this hash is already in the cracked list
      const exists = prev.some(hash => hash.id === result.id);
      if (exists) return prev;
      
      // Add the new cracked hash
      return [...prev, {
        id: result.id,
        value: result.hash,
        cracked: true,
        plaintext: result.plaintext
      }];
    });
  };
  
  // Start the cracking process
  const startCracking = (options: CrackingOptions) => {
    setIsRunning(true);
    setProgress(0);
    setCrackedHashes([]);
    setStats(initialStats);
    optionsRef.current = options;
    
    // Initialize the appropriate worker
    const worker = initializeWorker(options);
    if (!worker) {
      setIsRunning(false);
      return;
    }
    
    // Send the start command to the worker
    worker.postMessage({
      command: 'start',
      hashes: options.hashes,
      algorithm: options.algorithm
    });
  };
  
  // Stop the cracking process
  const stopCracking = () => {
    if (!isRunning) return;
    
    // Send stop command to the active worker
    [dictionaryWorkerRef, bruteForceWorkerRef, hybridWorkerRef].forEach(workerRef => {
      if (workerRef.current) {
        workerRef.current.postMessage({ command: 'stop' });
      }
    });
    
    setIsRunning(false);
  };
  
  return {
    startCracking,
    stopCracking,
    isRunning,
    progress,
    crackedHashes,
    stats
  };
}