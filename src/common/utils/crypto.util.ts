import * as crypto from 'crypto';

// AES-256-CBC
const KEY = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY || '')).digest();
if (!process.env.ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY should be set in production.');
}

export function encryptField(plain: string): { iv: string; data: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return { iv: iv.toString('base64'), data: encrypted.toString('base64') };
}

export function decryptField(ivB64: string, dataB64: string): string {
  if (!ivB64 || !dataB64) return '';
  const iv = Buffer.from(ivB64, 'base64');
  const encrypted = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
