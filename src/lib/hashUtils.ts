import CryptoJS from 'crypto-js';
import { HashAlgorithm } from './types';

export function hashString(input: string, algorithm: HashAlgorithm): string {
  switch (algorithm) {
    case 'md5':
      return CryptoJS.MD5(input).toString();
    case 'sha1':
      return CryptoJS.SHA1(input).toString();
    case 'sha256':
      return CryptoJS.SHA256(input).toString();
    default:
      throw new Error(`Unsupported hash algorithm: ${algorithm}`);
  }
}