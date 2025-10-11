import { API_CONFIG, API_URLS } from '@/config/api';

export interface InitResponse {
  status: string;
  categories: string[];
  metadata: {
    total_products: number;
    colors_available: string[];
    last_updated: string;
  };
}

/**
 * Fetch initialization data from backend
 * This endpoint wakes up the Render deployment and returns available categories
 */
export async function fetchInit(apiUrl?: string): Promise<InitResponse> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;

    console.log('🚀 Fetching initialization data from:', `${baseUrl}${API_CONFIG.ENDPOINTS.INIT}`);

    const response = await fetch(`${baseUrl}${API_CONFIG.ENDPOINTS.INIT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: InitResponse = await response.json();

    console.log('✅ Initialization data received:', {
      status: data.status,
      categories: data.categories,
      totalProducts: data.metadata?.total_products,
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching initialization data:', error);
    throw error;
  }
}
