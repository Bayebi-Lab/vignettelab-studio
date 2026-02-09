import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Package {
  id: string; // UUID from database
  name: string;
  price: number;
  portraits: number; // portraits_count from database
  features: string[]; // parsed from JSONB
  popular?: boolean; // Optional, can be determined by logic or added to DB
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('packages')
          .select('*')
          .order('price', { ascending: true }); // Order by price ascending

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('No packages found');
        }

        // Transform database format to frontend format
        const transformedPackages: Package[] = data.map((pkg) => ({
          id: pkg.id, // Use UUID from database
          name: pkg.name,
          price: parseFloat(pkg.price.toString()),
          portraits: pkg.portraits_count,
          features: Array.isArray(pkg.features) ? pkg.features : [],
          // Mark middle package as popular (or could be added to DB)
          popular: false, // Will be set by component logic if needed
        }));

        // Mark middle package as popular if we have 3 packages
        if (transformedPackages.length === 3) {
          transformedPackages[1].popular = true;
        }

        setPackages(transformedPackages);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    }

    fetchPackages();
  }, []);

  return { packages, loading, error };
}
