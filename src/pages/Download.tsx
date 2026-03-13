import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download as DownloadIcon, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ImageWithUrl {
  url: string;
  filename: string;
}

export default function Download() {
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const queryOrderId = searchParams.get('order_id');
  const orderId = paramOrderId || queryOrderId;

  const [password, setPassword] = useState('');
  const [images, setImages] = useState<ImageWithUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !password.trim()) {
      toast.error('Please enter your download password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/download/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Invalid password. Please check the password from your email.');
        } else if (response.status === 404) {
          toast.error('Order not found');
        } else {
          toast.error(data.error || 'Failed to verify access');
        }
        return;
      }

      setImages(data.images || []);
      setVerified(true);
    } catch (error) {
      console.error('Error verifying download:', error);
      toast.error('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (!orderId || !password.trim()) return;

    setDownloadingZip(true);
    try {
      const response = await fetch('/api/download/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, password: password.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create zip');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? `portraits-${orderId.slice(0, 8)}.zip`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${images.length} portraits as zip`);
    } catch (error) {
      console.error('Error creating zip:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create zip');
    } finally {
      setDownloadingZip(false);
    }
  };

  const downloadSingleImage = async (image: ImageWithUrl, index: number) => {
    if (!orderId || !password.trim()) return;

    try {
      const response = await fetch('/api/download/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, password: password.trim(), index }),
      });

      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
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

  if (!verified) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Enter Your Download Password</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the password from your email to access your portraits.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Download Password</Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder="Enter password from email"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    disabled={loading}
                    className="font-mono"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Access My Portraits'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
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
                <Button onClick={downloadAllAsZip} disabled={downloadingZip}>
                  {downloadingZip ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating zip...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download All as ZIP ({images.length})
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => downloadSingleImage(image, index)}
                    className="group relative block aspect-square rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer w-full text-left"
                  >
                    <img
                      src={image.url}
                      alt={`Portrait ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <DownloadIcon className="h-8 w-8 text-white" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> These download links are valid for 7 days. Use &quot;Download All as ZIP&quot; to get all portraits in one file, or click on each image to download individually.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
