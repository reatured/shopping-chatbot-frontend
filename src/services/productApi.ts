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
  filters: {
    category: string | null;
    color: string | null;
  };
}

export interface SearchResponse {
  products: Product[];
  count: number;
  query: string;
  category: string | null;
}

/**
 * Get products with optional filters (supports any field)
 */
export async function getProducts(
  filters?: Record<string, string>,
  apiUrl?: string
): Promise<Product[]> {
  try {
    const baseUrl = apiUrl || localStorage.getItem('api_url') || API_URLS.PRODUCTION;

    const params = new URLSearchParams();

    // Add all filters dynamically
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${baseUrl}/api/products${queryString}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get products by category
 * Uses the dedicated GET /api/products endpoint with category filter
 */
export async function getProductsByCategory(
  category: 'car' | 'backpack',
  apiUrl?: string,
  additionalFilters?: Record<string, string>
): Promise<Product[]> {
  // Combine category with additional filters
  const filters = { category, ...additionalFilters };
  return getProducts(filters, apiUrl);
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
 *
 * @param productName - Product name or category from AI
 * @param apiUrl - Optional API URL
 * @param availableCategories - Dynamic categories from backend (default: ['car', 'backpack'])
 * @param additionalFilters - Additional filters to apply (e.g., {color: 'blue', brand: 'Nike'})
 */
export async function fetchProductsByName(
  productName: string,
  apiUrl?: string,
  availableCategories: string[] = ['car', 'backpack'],
  additionalFilters?: Record<string, string>
): Promise<Product[]> {
  const lowerName = productName.toLowerCase();

  // Normalize category name (replace underscores with spaces for matching)
  const normalizedName = lowerName.replace(/_/g, ' ');

  // Determine category by checking which one matches
  let matchedCategory: string | null = null;

  for (const cat of availableCategories) {
    const normalizedCat = cat.replace(/_/g, ' ').toLowerCase();
    const pluralCat = normalizedCat + 's';

    // Check if product name contains this category (exact or plural)
    if (normalizedName.includes(normalizedCat) || normalizedName.includes(pluralCat) || normalizedName === cat.toLowerCase()) {
      matchedCategory = cat;
      break;
    }
  }

  // If no category matched, fall back to first available category
  const category = matchedCategory || availableCategories[0];

  console.log(`🔍 Detected category "${category}" from product name "${productName}"`, {
    availableCategories,
    matchedCategory
  });

  // Check if it's just the category name (no additional descriptors)
  const isJustCategory = availableCategories.some(cat => {
    const normalizedCat = cat.replace(/_/g, ' ').toLowerCase();
    return lowerName === normalizedCat || lowerName === normalizedCat + 's' || lowerName === cat.toLowerCase();
  });

  if (isJustCategory) {
    // General category view - get all products in category
    console.log(`📦 Fetching all products for category: ${category}`, additionalFilters ? `with filters: ${JSON.stringify(additionalFilters)}` : '');
    return getProductsByCategory(category as any, apiUrl, additionalFilters);
  } else {
    // Specific search - extract search terms by removing category names
    let searchQuery = normalizedName;

    // Remove all category names from the search query
    for (const cat of availableCategories) {
      const normalizedCat = cat.replace(/_/g, ' ').toLowerCase();
      searchQuery = searchQuery.replace(new RegExp(`\\b${normalizedCat}s?\\b`, 'g'), '');
    }

    searchQuery = searchQuery.trim();

    if (searchQuery) {
      // Search with specific terms within the category
      console.log(`🔎 Searching for "${searchQuery}" in category "${category}"`, additionalFilters ? `with filters: ${JSON.stringify(additionalFilters)}` : '');
      // Note: searchProducts doesn't support additional filters yet, but we log them for future enhancement
      return searchProducts(searchQuery, category as any, apiUrl);
    } else {
      // Fallback to category browse
      console.log(`📦 Fallback: Fetching all products for category: ${category}`, additionalFilters ? `with filters: ${JSON.stringify(additionalFilters)}` : '');
      return getProductsByCategory(category as any, apiUrl, additionalFilters);
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
