import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { supabase } from '@/lib/supabase';
import { uploadFinalImages } from '@/lib/storage';
import { ArrowLeft, Mail, Package, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_email: string;
  package_name: string;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface OrderImage {
  id: string;
  image_url: string;
  type: 'uploaded' | 'final';
  created_at: string;
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [uploadedImages, setUploadedImages] = useState<OrderImage[]>([]);
  const [finalImages, setFinalImages] = useState<OrderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [finalImageFiles, setFinalImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchImages();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('order_images')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const uploaded = data?.filter((img) => img.type === 'uploaded') || [];
      const final = data?.filter((img) => img.type === 'final') || [];

      setUploadedImages(uploaded);
      setFinalImages(final);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleUploadFinalImages = async () => {
    if (finalImageFiles.length === 0) {
      toast.error('Please select at least one final image');
      return;
    }

    if (!order) return;

    setProcessing(true);

    try {
      // Upload images to Supabase Storage
      const uploadResults = await uploadFinalImages(finalImageFiles, order.id);

      // Save image records to database
      const imageRecords = uploadResults.map((result) => ({
        order_id: order.id,
        image_url: result.url,
        type: 'final' as const,
      }));

      const { error: insertError } = await supabase
        .from('order_images')
        .insert(imageRecords);

      if (insertError) throw insertError;

      // Update order status to completed
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Send download email to customer
      await sendDownloadEmail(uploadResults.map((r) => r.url));

      toast.success('Final images uploaded and email sent successfully');
      setFinalImageFiles([]);
      fetchOrder();
      fetchImages();
    } catch (error) {
      console.error('Error uploading final images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const sendDownloadEmail = async (downloadUrls: string[]) => {
    if (!order) return;

    try {
      // Generate signed URLs (in production, you'd want to use signed URLs)
      // For now, we'll use the public URLs
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: order.customer_email,
          subject: 'Your Portraits Are Ready!',
          template_type: 'download_ready',
          data: {
            orderId: order.id,
            packageName: order.package_name,
            downloadLinks: downloadUrls,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Don't throw - images are uploaded, email can be sent manually
      toast.error('Images uploaded but failed to send email. Please send manually.');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Order not found</p>
              <Button onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen bg-cream">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/orders')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail size={14} />
                        Customer Email
                      </p>
                      <p className="font-medium">{order.customer_email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Package size={14} />
                        Package
                      </p>
                      <p className="font-medium">{order.package_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold text-lg">${order.price.toFixed(2)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={statusColors[order.status]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} />
                        Created
                      </p>
                      <p className="text-sm">
                        {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Processing */}
              <div className="lg:col-span-2 space-y-6">
                {/* Uploaded Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Images ({uploadedImages.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {uploadedImages.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No images uploaded yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                          <div
                            key={image.id}
                            className="aspect-square rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={image.image_url}
                              alt="Uploaded"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Final Images */}
                {finalImages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Final Portraits ({finalImages.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {finalImages.map((image) => (
                          <div
                            key={image.id}
                            className="aspect-square rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={image.image_url}
                              alt="Final portrait"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upload Final Images */}
                {order.status !== 'completed' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Final Portraits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ImageUploader
                        onImagesChange={setFinalImageFiles}
                        maxImages={order.package_name === 'Professional' ? 50 : 20}
                      />
                      <Button
                        onClick={handleUploadFinalImages}
                        disabled={processing || finalImageFiles.length === 0}
                        className="w-full"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Upload & Send to Customer
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Upload the final processed portraits. An email with download links will be
                        sent to the customer automatically.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
