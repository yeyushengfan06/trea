import CryptoJS from 'crypto-js';

export const generateHash = (input: string): string => {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
};

export const hexToInt = (hex: string): number => {
  return parseInt(hex, 16);
};

// Get a deterministic random number between min and max using a seed
export const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const result = Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  return result;
};
