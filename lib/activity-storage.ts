import { promises as fs } from 'fs';
import path from 'path';

export interface ActivityPost {
  id: string;
  text: string;
  imageUrl: string | null;
  likes: number;
  likedBy: string[]; // Array of IP addresses or session IDs
  createdAt: string;
  userId?: string; // User ID of the post author (optional for backward compatibility)
  userName?: string; // User name of the post author (optional for backward compatibility)
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read activity data
export async function readActivity(): Promise<ActivityPost[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write activity data with safe atomic write
export async function writeActivity(posts: ActivityPost[]): Promise<void> {
  await ensureDataDir();
  const tempFile = `${ACTIVITY_FILE}.tmp`;
  try {
    // Write to temp file first
    await fs.writeFile(tempFile, JSON.stringify(posts, null, 2), 'utf-8');
    // Atomic rename
    await fs.rename(tempFile, ACTIVITY_FILE);
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempFile);
    } catch {}
    throw error;
  }
}

// Get a unique identifier for likes (IP or session)
export function getLikeIdentifier(req: Request): string {
  // Try to get IP from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
              req.headers.get('x-real-ip') || 
              'anonymous';
  return ip;
}


