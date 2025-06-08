export type HashAlgorithm = 'md5' | 'sha1' | 'sha256';
export type AttackMode = 'dictionary' | 'bruteforce' | 'hybrid';

export interface Hash {
  id: string;
  value: string;
  cracked: boolean;
  plaintext: string | null;
}

export interface CrackingOptions {
  hashes: Hash[];
  attackMode: AttackMode;
  algorithm: HashAlgorithm;
}

export interface CrackingStats {
  attempts: number;
  elapsedTime: number; // in milliseconds
  hashesPerSecond: number;
}

export interface CrackedResult {
  id: string;
  hash: string;
  plaintext: string;
}

export interface WorkerMessage {
  type: 'progress' | 'result' | 'stats';
  data: any;
}

export interface PasswordRule {
  name: string;
  apply: (word: string) => string[];
}