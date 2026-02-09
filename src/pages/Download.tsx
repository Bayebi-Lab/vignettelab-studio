import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Download as DownloadIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderImage {
  id: string;
  image_url: string;
  type: 'uploaded' | 'final';
  created_at: string;
}

export default function Download() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [images, setImages] = useState<OrderImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchImages();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchImages = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('order_images')
        .select('*')
        .eq('order_id', orderId)
        .eq('type', 'final')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = () => {
    images.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image.image_url;
      link.download = `portrait-${index + 1}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (!orderId) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Invalid Download Link</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No order ID provided. Please use the download link from your email.
              </p>
              <Button asChild>
                <a href="/order-status">Check Order Status</a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (images.length === 0) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Images Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No final portraits are available for this order yet. Please check back later.
              </p>
              <Button asChild>
                <a href="/order-status">Check Order Status</a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Download Your Portraits</CardTitle>
                <Button onClick={downloadAll}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download All ({images.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={image.image_url}
                      alt={`Portrait ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={image.image_url}
                        download={`portrait-${index + 1}.jpg`}
                        className="text-white hover:text-primary-foreground"
                      >
                        <DownloadIcon className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> These download links are valid for 7 days. Please download
                  your portraits soon. For best quality, right-click on each image and select "Save
                  image as..."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
