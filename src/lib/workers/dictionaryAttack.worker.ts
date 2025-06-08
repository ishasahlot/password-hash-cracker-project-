// This is a Web Worker file
import { Hash, HashAlgorithm, CrackedResult, WorkerMessage } from '../types';
import { getPasswordRules } from '../passwordRules';
import { hashString } from '../hashUtils';

// Self reference for the worker
const ctx: Worker = self as any;

// Dictionary of common passwords
const commonPasswords = [
  'password', '123456', 'qwerty', 'admin', 'welcome',
  'login', 'abc123', 'letmein', 'monkey', 'superman',
  '696969', 'sunshine', 'football', 'shadow', 'baseball',
  '123123', 'master', 'ninja', 'dragon', 'trustno1',
  'batman', 'iloveyou', 'princess', 'admin123', 'welcome123'
];

// Common mutation rules
const passwordRules = getPasswordRules();

let running = false;
let hashesProcessed = 0;
let startTime = 0;

ctx.addEventListener('message', (event) => {
  const { command, hashes, algorithm } = event.data;

  if (command === 'start') {
    running = true;
    hashesProcessed = 0;
    startTime = Date.now();
    runDictionaryAttack(hashes, algorithm);
  } else if (command === 'stop') {
    running = false;
  }
});

function runDictionaryAttack(hashes: Hash[], algorithm: HashAlgorithm) {
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
  
  const words = [...commonPasswords];
  const mutatedWords: string[] = [];
  
  // Apply basic mutations to each password
  for (const word of words) {
    // First, add the original word
    mutatedWords.push(word);
    
    // Then apply each rule
    for (const rule of passwordRules) {
      const mutations = rule.apply(word);
      mutatedWords.push(...mutations);
    }
  }
  
  // No duplicates
  const uniqueWords = [...new Set(mutatedWords)];
  const totalWords = uniqueWords.length;
  
  // Start the attack
  let counter = 0;
  let reportCounter = 0;
  
  // Process in smaller batches to allow progress updates
  const batchSize = 100;
  const processBatch = (startIdx: number) => {
    if (!running) return;
    
    const endIdx = Math.min(startIdx + batchSize, totalWords);
    
    for (let i = startIdx; i < endIdx; i++) {
      const word = uniqueWords[i];
      const hashedWord = hashString(word, algorithm);
      hashesProcessed++;
      
      if (targetHashes.has(hashedWord)) {
        const hashId = targetHashes.get(hashedWord);
        results.push({
          id: hashId!,
          hash: hashedWord,
          plaintext: word
        });
        
        // Report the cracked password
        ctx.postMessage({
          type: 'result',
          data: {
            id: hashId,
            hash: hashedWord,
            plaintext: word
          }
        });
        
        // Remove from target hashes to avoid duplicates
        targetHashes.delete(hashedWord);
      }
      
      counter++;
      reportCounter++;
      
      // Report progress every 500 words processed
      if (reportCounter >= 500 || counter === totalWords) {
        reportProgress((counter / totalWords) * 100);
        reportCounter = 0;
        
        // If all hashes are cracked, stop
        if (targetHashes.size === 0) {
          running = false;
          break;
        }
      }
    }
    
    // Process next batch or finish
    if (endIdx < totalWords && running) {
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