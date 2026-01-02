
// Supabase Configuration
export const SUPABASE_URL = "https://aebsnufnogmjicpriezc.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlYnNudWZub2dtamljcHJpZXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTI4MzEsImV4cCI6MjA4MTQyODgzMX0.Ew7IaWHMWjUTrtf8mahMTWss34sQIZeQDrJKeuUxwMY";

// --- AVATAR CONFIGURATION ---
// DiceBear "Initials" API with a consistent true yellow background.
// Using Tailwind's yellow-400 color (#facc15) for a brighter, truer yellow.
const YELLOW_BG = "facc15";

export const AVATAR_MAP: Record<string, string> = {
  // Harun - BABA
  'harun': `https://api.dicebear.com/9.x/initials/svg?seed=Harun&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`,
  'admin': `https://api.dicebear.com/9.x/initials/svg?seed=Harun&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`,
  
  // Elif - ANNE
  'elif': `https://api.dicebear.com/9.x/initials/svg?seed=Elif&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`,
  'anne': `https://api.dicebear.com/9.x/initials/svg?seed=Elif&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`,
  
  // Uraz - ERKEK ÇOCUK
  'uraz': `https://api.dicebear.com/9.x/initials/svg?seed=Uraz&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`,
  'cocuk': `https://api.dicebear.com/9.x/initials/svg?seed=Uraz&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`,
};

// Helper function to get avatar
export const getUserAvatar = (username: string, dbAvatarUrl?: string) => {
  if (!username) return '';
  const lowerName = username.trim().toLowerCase();
  
  // 1. Direct match from our family map
  if (AVATAR_MAP[lowerName]) {
    return AVATAR_MAP[lowerName];
  }

  // 2. Database provided URL (if any)
  if (dbAvatarUrl) {
    return dbAvatarUrl;
  }

  // 3. Fallback to a consistent generic initials icon with true yellow background
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=${YELLOW_BG}&chars=1&fontSize=45&fontWeight=700`;
};
