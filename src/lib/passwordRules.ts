import { PasswordRule } from './types';

export function getPasswordRules(): PasswordRule[] {
  return [
    {
      name: 'Capitalize First Letter',
      apply: (word: string) => {
        if (word.length === 0) return [word];
        return [word.charAt(0).toUpperCase() + word.slice(1)];
      }
    },
    {
      name: 'Add Common Numbers',
      apply: (word: string) => {
        return ['1', '123', '12345', '2023', '2024'].map(num => word + num);
      }
    },
    {
      name: 'Leetspeak Substitution',
      apply: (word: string) => {
        const substitutions: Record<string, string> = {
          'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'
        };
        
        let result = word;
        for (const [char, replacement] of Object.entries(substitutions)) {
          if (word.includes(char)) {
            result = result.replaceAll(char, replacement);
          }
        }
        
        return result !== word ? [result] : [];
      }
    },
    {
      name: 'Add Special Characters',
      apply: (word: string) => {
        return ['!', '@', '#', '$', '*'].map(char => word + char);
      }
    },
    {
      name: 'Reverse',
      apply: (word: string) => {
        return [word.split('').reverse().join('')];
      }
    },
    {
      name: 'Double Word',
      apply: (word: string) => {
        return [word + word];
      }
    },
    {
      name: 'Replace Vowels',
      apply: (word: string) => {
        return [word.replace(/[aeiou]/g, '*')];
      }
    }
  ];
}