import React from 'react';
import { Hash } from '../../lib/types';
import { Check, Download } from 'lucide-react';

interface ResultsDisplayProps {
  crackedHashes: Hash[];
  totalHashes: number;
}

export default function ResultsDisplay({ crackedHashes, totalHashes }: ResultsDisplayProps) {
  const downloadResults = () => {
    if (crackedHashes.length === 0) return;
    
    const content = crackedHashes.map(hash => 
      `${hash.value}:${hash.plaintext}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cracked_passwords_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="border dark:border-gray-700 border-gray-200 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold dark:text-white text-gray-900 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          Results
        </h2>
        
        {crackedHashes.length > 0 && (
          <button
            onClick={downloadResults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        )}
      </div>
      
      <div className="mb-3 flex justify-between items-center">
        <div className="text-sm dark:text-gray-300 text-gray-700">
          Cracked <span className="font-medium">{crackedHashes.length}</span> of <span className="font-medium">{totalHashes}</span> hashes
        </div>
        
        {totalHashes > 0 && (
          <div className="text-sm font-medium">
            <span className={
              crackedHashes.length > 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-500 dark:text-gray-400"
            }>
              {Math.round((crackedHashes.length / totalHashes) * 100) || 0}%
            </span>
          </div>
        )}
      </div>
      
      {crackedHashes.length > 0 ? (
        <div className="max-h-64 overflow-y-auto pr-1">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 border-gray-200">
              <tr>
                <th className="pb-2 text-left">Hash</th>
                <th className="pb-2 text-left">Password</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 divide-gray-200">
              {crackedHashes.map(hash => (
                <tr key={hash.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-2 font-mono text-xs truncate dark:text-gray-300 text-gray-700 pr-4" title={hash.value}>
                    {hash.value.substring(0, 8)}...{hash.value.substring(hash.value.length - 4)}
                  </td>
                  <td className="py-2 font-medium dark:text-white text-gray-900">
                    {hash.plaintext}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400 italic">
          {totalHashes > 0 
            ? "No hashes cracked yet" 
            : "Add hashes to start cracking"}
        </div>
      )}
      
      {crackedHashes.length > 0 && (
        <div className="mt-4 pt-3 border-t dark:border-gray-700 border-gray-200">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">Security Tip:</span> Passwords that are easily cracked should be updated immediately. Use a combination of uppercase, lowercase, numbers, and special characters.
          </p>
        </div>
      )}
    </div>
  );
}