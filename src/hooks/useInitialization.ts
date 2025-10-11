import { useState, useEffect, useCallback } from 'react';
import { fetchInit, InitResponse } from '@/services/initApi';
import {
  getCachedInitData,
  setCachedInitData,
  isCacheExpired,
} from '@/utils/cache';

export interface InitData {
  isInitialized: boolean;
  isLoading: boolean;
  categories: string[];
  metadata: {
    total_products: number;
    colors_available: string[];
    last_updated: string;
  } | null;
  error: string | null;
}

const DEFAULT_CATEGORIES = ['car', 'backpack'];
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

/**
 * Custom hook for handling initialization data from /api/init endpoint
 * Implements cache-first strategy with background refresh and retry logic
 */
export function useInitialization(apiUrl?: string) {
  const [initData, setInitData] = useState<InitData>({
    isInitialized: false,
    isLoading: true,
    categories: DEFAULT_CATEGORIES,
    metadata: null,
    error: null,
  });

  /**
   * Fetch initialization data with retry logic
   */
  const fetchInitData = useCallback(
    async (isBackground: boolean = false, retryCount: number = 0): Promise<void> => {
      // Don't set loading state if this is a background refresh
      if (!isBackground) {
        setInitData((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        const response: InitResponse = await fetchInit(apiUrl);

        // Update state with fresh data
        setInitData({
          isInitialized: true,
          isLoading: false,
          categories: response.categories.length > 0 ? response.categories : DEFAULT_CATEGORIES,
          metadata: response.metadata,
          error: null,
        });

        // Cache the successful response
        setCachedInitData(response.categories, response.metadata);

        console.log('✅ Initialization complete:', {
          categories: response.categories,
          isBackground,
        });
      } catch (error) {
        console.error(`❌ Init fetch failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);

        // Retry with exponential backoff if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          console.log(`⏳ Retrying in ${delay}ms...`);

          setTimeout(() => {
            fetchInitData(isBackground, retryCount + 1);
          }, delay);
        } else {
          // All retries exhausted - use fallback
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to initialize';

          console.warn('⚠️ All retries exhausted, using fallback categories');

          setInitData({
            isInitialized: true, // Mark as initialized even with fallback
            isLoading: false,
            categories: DEFAULT_CATEGORIES,
            metadata: null,
            error: errorMessage,
          });
        }
      }
    },
    [apiUrl]
  );

  /**
   * Initialize on mount
   */
  useEffect(() => {
    const initializeApp = async () => {
      // Check cache first
      const cached = getCachedInitData();

      if (cached) {
        if (!isCacheExpired(cached)) {
          // Cache is fresh - use it immediately
          console.log('✅ Using fresh cached init data');
          setInitData({
            isInitialized: true,
            isLoading: false,
            categories: cached.categories,
            metadata: cached.metadata,
            error: null,
          });

          // Refresh in background to ensure data is up-to-date
          console.log('🔄 Refreshing init data in background...');
          fetchInitData(true, 0);
          return;
        } else {
          console.log('⏰ Cache expired, fetching fresh data');
        }
      } else {
        console.log('💾 No cache found, fetching init data');
      }

      // Cache is stale or missing - fetch fresh data with loading state
      await fetchInitData(false, 0);
    };

    initializeApp();
  }, [fetchInitData]);

  /**
   * Manual refetch function for error recovery
   */
  const refetch = useCallback(() => {
    fetchInitData(false, 0);
  }, [fetchInitData]);

  return {
    ...initData,
    refetch,
  };
}
