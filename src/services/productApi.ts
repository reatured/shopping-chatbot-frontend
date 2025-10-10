import { API_CONFIG, API_URLS } from '@/config/api';

export interface Product {
  id: number;
  name: string;
  category: 'car' | 'backpack';
  brand: string;
  price: number;
  color: string;
  description: string;
  image_url: string;
  tags: string;
  publish_time: string;
  selling_quantity: string;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
  category: string | null;
}

export interface SearchResponse {
  products: Product[];
  count: number;
  query: string;
  category: string | null;
}

/**
 * Get products by category
 * Note: Backend doesn't have a dedicated category endpoint yet,
 * so we use the search endpoint with category as the query
 */
export async function getProductsByCategory(
  category: 'car' | 'backpack',
  apiUrl?: string
): Promise<Product[]> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;

    // Use search endpoint with category name as query
    // This works because products have category in their name, description, or tags
    const response = await fetch(`${baseUrl}/api/products/search?q=${category}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

/**
 * Search products by query
 */
export async function searchProducts(
  query: string,
  category?: 'car' | 'backpack',
  apiUrl?: string
): Promise<Product[]> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;
    const categoryParam = category ? `&category=${category}` : '';
    const response = await fetch(
      `${baseUrl}/api/products/search?q=${encodeURIComponent(query)}${categoryParam}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(
  id: number,
  apiUrl?: string
): Promise<Product> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;
    const response = await fetch(`${baseUrl}/api/products/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Product = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
}

/**
 * Smart fetch products based on product name from AI
 * Determines whether to use category browse or search
 */
export async function fetchProductsByName(
  productName: string,
  apiUrl?: string
): Promise<Product[]> {
  const lowerName = productName.toLowerCase();

  // Determine category
  const category = lowerName.includes('car') ? 'car' : 'backpack';

  // Check if it's just the category or a specific search
  if (lowerName === 'car' || lowerName === 'backpack' || lowerName === 'cars' || lowerName === 'backpacks') {
    // General category view - get all products in category
    return getProductsByCategory(category, apiUrl);
  } else {
    // Specific search - extract search terms
    const searchQuery = lowerName
      .replace(/car|cars|backpack|backpacks/g, '')
      .trim();

    if (searchQuery) {
      // Search with specific terms
      return searchProducts(searchQuery, category, apiUrl);
    } else {
      // Fallback to category browse
      return getProductsByCategory(category, apiUrl);
    }
  }
}

/**
 * Sort products by different criteria
 */
export function sortProducts(
  products: Product[],
  sortBy: 'price_asc' | 'price_desc' | 'popular' | 'newest'
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'popular':
      return sorted.sort((a, b) => parseInt(b.selling_quantity) - parseInt(a.selling_quantity));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime());
    default:
      return sorted;
  }
}
