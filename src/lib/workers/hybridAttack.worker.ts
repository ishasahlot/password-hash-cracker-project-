// This is a Web Worker file
import { Hash, HashAlgorithm, CrackedResult, WorkerMessage } from '../types';
import { getPasswordRules } from '../passwordRules';
import { hashString } from '../hashUtils';

// Self reference for the worker
const ctx: Worker = self as any;

// Dictionary of common password bases
const commonBases = [
  'password', 'admin', 'welcome', 'login', 'user', 
  'qwerty', 'football', 'baseball', 'dragon', 'monkey',
  'sunshine', 'princess', 'letmein', 'abc', 'master'
];

// Common suffixes and prefixes
const commonSuffixes = [
  '123', '1234', '12345', '!', '@', '#', '1!', '2@', '3#',
  '_2023', '_2024', '!'
];

const commonPrefixes = [
  'The', 'My', 'A', '1', '123', 'the', 'a'
];

let running = false;
let hashesProcessed = 0;
let startTime = 0;

ctx.addEventListener('message', (event) => {
  const { command, hashes, algorithm } = event.data;

  if (command === 'start') {
    running = true;
    hashesProcessed = 0;
    startTime = Date.now();
    runHybridAttack(hashes, algorithm);
  } else if (command === 'stop') {
    running = false;
  }
});

function runHybridAttack(hashes: Hash[], algorithm: HashAlgorithm) {
  const targetHashes = new Map(hashes.map(hash => [hash.value, hash.id]));
  const results: CrackedResult[] = [];
  
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
  
  // Generate all combinations of base words with prefixes and suffixes
  const combinations: string[] = [];
  
  // Base words alone
  combinations.push(...commonBases);
  
  // Base words with suffixes
  for (const base of commonBases) {
    for (const suffix of commonSuffixes) {
      combinations.push(base + suffix);
    }
  }
  
  // Base words with prefixes
  for (const prefix of commonPrefixes) {
    for (const base of commonBases) {
      combinations.push(prefix + base);
    }
  }
  
  // Base words with both prefixes and suffixes
  for (const prefix of commonPrefixes) {
    for (const base of commonBases) {
      for (const suffix of commonSuffixes) {
        combinations.push(prefix + base + suffix);
      }
    }
  }
  
  // Apply some mutation rules
  const passwordRules = getPasswordRules();
  const mutatedCombinations: string[] = [];
  
  for (const combo of combinations) {
    mutatedCombinations.push(combo);
    
    // Apply 1-2 rules to avoid combinatorial explosion
    for (let i = 0; i < 2; i++) {
      const rule = passwordRules[i % passwordRules.length];
      const mutations = rule.apply(combo);
      mutatedCombinations.push(...mutations);
    }
  }
  
  // Get unique combinations
  const uniqueCombinations = [...new Set(mutatedCombinations)];
  const totalCombinations = uniqueCombinations.length;
  
  let counter = 0;
  let reportCounter = 0;
  
  // Process in smaller batches to allow progress updates
  const batchSize = 500;
  const processBatch = (startIdx: number) => {
    if (!running) return;
    
    const endIdx = Math.min(startIdx + batchSize, totalCombinations);
    
    for (let i = startIdx; i < endIdx; i++) {
      const password = uniqueCombinations[i];
      const hashedPassword = hashString(password, algorithm);
      hashesProcessed++;
      
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
      
      counter++;
      reportCounter++;
      
      // Report progress every 500 passwords tested
      if (reportCounter >= 500 || counter === totalCombinations) {
        reportProgress((counter / totalCombinations) * 100);
        reportCounter = 0;
        
        // If all hashes are cracked, stop
        if (targetHashes.size === 0) {
          running = false;
          break;
        }
      }
    }
    
    // Process next batch or finish
    if (endIdx < totalCombinations && running) {
      setTimeout(() => processBatch(endIdx), 0);
    } else {
      // Finished all words
      reportProgress(100);
      running = false;
    }
  };
  
  // Start with the first batch
  processBatch(0);
}