import React, { useState, ChangeEvent } from 'react';
import { Hash, HashAlgorithm } from '../../lib/types';
import { AlertCircle, FileText, Trash2 } from 'lucide-react';

interface HashInputProps {
  onHashesChange: (hashes: Hash[]) => void;
  disabled: boolean;
  algorithm: HashAlgorithm;
}

export default function HashInput({ onHashesChange, disabled, algorithm }: HashInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentHashes, setCurrentHashes] = useState<Hash[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isValidHash = (hash: string, algorithm: HashAlgorithm): boolean => {
    const hashLengths: Record<HashAlgorithm, number> = {
      md5: 32,
      sha1: 40,
      sha256: 64,
    };
    
    // Simple validation by length and hex characters
    return hash.length === hashLengths[algorithm] && /^[a-fA-F0-9]+$/.test(hash);
  };

  const addHash = () => {
    const trimmedHash = inputValue.trim();
    if (!trimmedHash) {
      setError('Please enter a hash value');
      return;
    }

    if (!isValidHash(trimmedHash, algorithm)) {
      setError(`Invalid ${algorithm.toUpperCase()} hash format`);
      return;
    }

    const hashExists = currentHashes.some(h => h.value === trimmedHash);
    if (hashExists) {
      setError('This hash has already been added');
      return;
    }

    const newHash: Hash = {
      id: `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      value: trimmedHash,
      cracked: false,
      plaintext: null,
    };

    const updatedHashes = [...currentHashes, newHash];
    setCurrentHashes(updatedHashes);
    onHashesChange(updatedHashes);
    setInputValue('');
    setError(null);
  };

  const removeHash = (id: string) => {
    const updatedHashes = currentHashes.filter(hash => hash.id !== id);
    setCurrentHashes(updatedHashes);
    onHashesChange(updatedHashes);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
      
      const newHashes: Hash[] = [];
      const invalid: string[] = [];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (isValidHash(trimmedLine, algorithm)) {
          if (!currentHashes.some(h => h.value === trimmedLine) && 
              !newHashes.some(h => h.value === trimmedLine)) {
            newHashes.push({
              id: `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              value: trimmedLine,
              cracked: false,
              plaintext: null,
            });
          }
        } else {
          invalid.push(trimmedLine);
        }
      });

      if (invalid.length > 0) {
        setError(`${invalid.length} invalid hash(es) found in the file`);
      } else {
        setError(null);
      }

      const updatedHashes = [...currentHashes, ...newHashes];
      setCurrentHashes(updatedHashes);
      onHashesChange(updatedHashes);
    };

    reader.readAsText(file);
    // Reset the file input
    event.target.value = '';
  };

  return (
    <div className="border dark:border-gray-700 border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 dark:text-white text-gray-900">Hash Input</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHash()}
              disabled={disabled}
              placeholder={`Enter ${algorithm.toUpperCase()} hash...`}
              className="flex-1 px-3 py-2 border dark:border-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-60"
            />
            <button
              onClick={addHash}
              disabled={disabled || !inputValue.trim()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md transition-colors duration-200"
            >
              Add
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-1.5 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm dark:text-gray-300 text-gray-600">Or upload a file:</span>
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md cursor-pointer text-sm dark:text-gray-300 text-gray-700 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Select File</span>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={disabled}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="border-t dark:border-gray-700 border-gray-200 pt-3">
          <h3 className="text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
            Added Hashes ({currentHashes.length})
          </h3>
          
          {currentHashes.length > 0 ? (
            <div className="max-h-40 overflow-y-auto pr-1 space-y-1">
              {currentHashes.map(hash => (
                <div 
                  key={hash.id} 
                  className="flex justify-between items-center py-1.5 px-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                >
                  <code className="text-xs font-mono dark:text-gray-300 text-gray-800 overflow-hidden overflow-ellipsis">
                    {hash.value}
                  </code>
                  <button
                    onClick={() => removeHash(hash.id)}
                    disabled={disabled}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove hash"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              No hashes added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}