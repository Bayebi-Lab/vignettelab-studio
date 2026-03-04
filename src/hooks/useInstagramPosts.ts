import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface InstagramPost {
  id: string;
  image_url: string;
  caption?: string;
  permalink: string;
  media_type: 'IMAGE' | 'VIDEO';
  sort_order: number;
}

export function useInstagramPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('instagram_posts')
          .select('*')
          .order('sort_order', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setPosts((data ?? []).map((p) => ({
          id: p.id,
          image_url: p.image_url,
          caption: p.caption ?? undefined,
          permalink: p.permalink,
          media_type: (p.media_type ?? 'IMAGE') as 'IMAGE' | 'VIDEO',
          sort_order: p.sort_order ?? 0,
        })));
      } catch (err) {
        console.error('Error fetching Instagram posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Instagram posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}
