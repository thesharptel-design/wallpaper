// Simple XOR obfuscation to prevent plain text storage.
// Note: This is client-side obfuscation, not military-grade encryption.
const SALT = "mood-canvas-salt-v1";

const xorEncrypt = (text: string): string => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
  }
  return btoa(result);
};

const xorDecrypt = (encryptedBase64: string): string => {
  try {
    const text = atob(encryptedBase64);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
    }
    return result;
  } catch (e) {
    return "";
  }
};

const STORAGE_KEY = "mood_canvas_api_key";

export const saveApiKey = (apiKey: string): void => {
  if (!apiKey) return;
  const encrypted = xorEncrypt(apiKey);
  localStorage.setItem(STORAGE_KEY, encrypted);
};

export const getApiKey = (): string | null => {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;
  return xorDecrypt(encrypted);
};

export const removeApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasStoredApiKey = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};