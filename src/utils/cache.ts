export interface CachedInitData {
  categories: string[];
  metadata: {
    total_products: number;
    colors_available: string[];
    last_updated: string;
  } | null;
  timestamp: number;
}

const CACHE_KEY = 'chatbot_init_data';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Retrieve cached initialization data from localStorage
 * Returns null if cache doesn't exist or is invalid
 */
export function getCachedInitData(): CachedInitData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedInitData;

    // Validate data structure
    if (!data.categories || !Array.isArray(data.categories) || !data.timestamp) {
      console.warn('Invalid cached init data structure, clearing cache');
      clearCachedInitData();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cached init data:', error);
    clearCachedInitData();
    return null;
  }
}

/**
 * Store initialization data in localStorage with current timestamp
 */
export function setCachedInitData(
  categories: string[],
  metadata: CachedInitData['metadata']
): void {
  try {
    const data: CachedInitData = {
      categories,
      metadata,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching init data:', error);
  }
}

/**
 * Check if cached data has expired (older than 1 hour)
 */
export function isCacheExpired(cachedData: CachedInitData): boolean {
  const age = Date.now() - cachedData.timestamp;
  return age > CACHE_EXPIRATION_MS;
}

/**
 * Clear cached initialization data
 */
export function clearCachedInitData(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cached init data:', error);
  }
}
