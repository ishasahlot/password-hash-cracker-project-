// This is a Web Worker file
import { Hash, HashAlgorithm, CrackedResult, WorkerMessage } from '../types';
import { hashString } from '../hashUtils';

// Self reference for the worker
const ctx: Worker = self as any;

// Character sets
const charSets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?'
};

let running = false;
let hashesProcessed = 0;
let startTime = 0;

ctx.addEventListener('message', (event) => {
  const { command, hashes, algorithm } = event.data;

  if (command === 'start') {
    running = true;
    hashesProcessed = 0;
    startTime = Date.now();
    runBruteForceAttack(hashes, algorithm);
  } else if (command === 'stop') {
    running = false;
  }
});

function runBruteForceAttack(hashes: Hash[], algorithm: HashAlgorithm) {
  const targetHashes = new Map(hashes.map(hash => [hash.value, hash.id]));
  const results: CrackedResult[] = [];
  
  // For demonstration purposes, we'll limit to 4 characters
  // In a real scenario, this would continue for longer passwords
  const maxLength = 4;
  
  // Use a smaller charset for demo purposes to make it faster
  const charset = charSets.lowercase + charSets.numbers;
  
  // Function to report progress
  const reportProgress = (progress: number) => {
    const elapsedTime = Date.now() - startTime;
    const hashesPerSecond = hashesProcessed / (elapsedTime / 1000);
    
    const message: WorkerMessage = {
      type: 'stats',
      data: {
        attempts: hashesProcessed,
        elapsedTime,
        hashesPerSecond
      }
    };
    ctx.postMessage(message);
    
    ctx.postMessage({
      type: 'progress',
      data: {
        progress
      }
    });
  };
  
  // Calculate total combinations for progress reporting
  const charsetLength = charset.length;
  let totalCombinations = 0;
  for (let length = 1; length <= maxLength; length++) {
    totalCombinations += Math.pow(charsetLength, length);
  }
  
  // Current password as array of indices into charset
  let currentIndices: number[] = [];
  let currentLength = 1;
  let combinationsTested = 0;
  
  // Initialize with smallest length
  currentIndices = Array(currentLength).fill(0);
  
  // Function to generate the next password
  const getNextPassword = (): string | null => {
    // If we've reached the end of the current length
    let overflow = true;
    
    for (let i = currentLength - 1; i >= 0; i--) {
      currentIndices[i]++;
      if (currentIndices[i] < charsetLength) {
        overflow = false;
        break;
      }
      currentIndices[i] = 0;
    }
    
    // If we've exhausted all combinations of the current length
    if (overflow) {
      currentLength++;
      if (currentLength > maxLength) {
        return null; // Done with all combinations
      }
      currentIndices = Array(currentLength).fill(0);
    }
    
    // Convert indices to characters
    return currentIndices.map(index => charset[index]).join('');
  };
  
  // Start the attack
  let reportCounter = 0;
  
  // Process in smaller batches to allow progress updates
  const batchSize = 1000;
  const processBatch = () => {
    if (!running) return;
    
    for (let i = 0; i < batchSize; i++) {
      const password = getNextPassword();
      if (password === null) {
        // All combinations tested
        reportProgress(100);
        running = false;
        return;
      }
      
      const hashedPassword = hashString(password, algorithm);
      hashesProcessed++;
      combinationsTested++;
      
      if (targetHashes.has(hashedPassword)) {
        const hashId = targetHashes.get(hashedPassword);
        results.push({
          id: hashId!,
          hash: hashedPassword,
          plaintext: password
        });
        
        // Report the cracked password
        ctx.postMessage({
          type: 'result',
          data: {
            id: hashId,
            hash: hashedPassword,
            plaintext: password
          }
        });
        
        // Remove from target hashes to avoid duplicates
        targetHashes.delete(hashedPassword);
      }
      
      reportCounter++;
      
      // Report progress every 1000 passwords tested
      if (reportCounter >= 1000) {
        const progress = Math.min((combinationsTested / totalCombinations) * 100, 99.9);
        reportProgress(progress);
        reportCounter = 0;
        
        // If all hashes are cracked, stop
        if (targetHashes.size === 0) {
          running = false;
          return;
        }
      }
    }
    
    // Process next batch
    if (running) {
      setTimeout(processBatch, 0);
    }
  };
  
  // Start with the first batch
  processBatch();
}