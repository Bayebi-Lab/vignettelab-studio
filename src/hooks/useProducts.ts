import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  portraits_count: number;
  features: string[];
  images: string[];
  category: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .order('price', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('No products found');
        }

        const transformedProducts: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
          description: p.description || null,
          price: parseFloat(p.price.toString()),
          compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price.toString()) : null,
          portraits_count: p.portraits_count || 1,
          features: Array.isArray(p.features) ? p.features : [],
          images: Array.isArray(p.images) ? p.images : [],
          category: p.category || 'maternity',
        }));

        setProducts(transformedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('Product not found');
        }

        setProduct({
          id: data.id,
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          description: data.description || null,
          price: parseFloat(data.price.toString()),
          compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price.toString()) : null,
          portraits_count: data.portraits_count || 1,
          features: Array.isArray(data.features) ? data.features : [],
          images: Array.isArray(data.images) ? data.images : [],
          category: data.category || 'maternity',
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}
