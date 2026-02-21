import { useState, useEffect } from 'react';

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
}

export function useInstagramMedia() {
  const [media, setMedia] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedia() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/instagram-media');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message ?? 'Failed to load Instagram media');
        }

        setMedia(data.media ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Instagram media');
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, []);

  return { media, loading, error };
}
