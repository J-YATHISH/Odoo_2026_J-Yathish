import prisma from '../prisma/client';

/**
 * Generates a short, human-readable organization join code.
 * Uses unambiguous uppercase letters and digits (avoiding 0, O, 1, I).
 */
export function generateRawCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AF-${code}`;
}

/**
 * Generates a unique organization join code, retrying if a collision occurs.
 */
export async function generateUniqueJoinCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateRawCode();
    const existing = await prisma.organization.findUnique({
      where: { joinCode: code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  throw new Error('Could not generate a unique organization code after 10 attempts');
}
