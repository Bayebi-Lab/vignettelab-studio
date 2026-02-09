import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Package, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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

export default function OrderStatus() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [finalImages, setFinalImages] = useState<OrderImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // If session_id is provided, try to fetch order by Stripe session
    if (sessionId) {
      fetchOrderBySession(sessionId);
    }
  }, [sessionId]);

  const fetchOrderBySession = async (sessionId: string) => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .single();

      if (error) throw error;

      setOrder(data);
      await fetchFinalImages(data.id);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!orderId && !email) {
      toast.error('Please enter an order ID or email address');
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('orders').select('*');

      if (orderId) {
        query = query.eq('id', orderId);
      } else if (email) {
        query = query.eq('customer_email', email).order('created_at', { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      setOrder(data);
      await fetchFinalImages(data.id);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found. Please check your order ID or email.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinalImages = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_images')
        .select('*')
        .eq('order_id', orderId)
        .eq('type', 'final')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFinalImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
      message: 'Your order is being prepared.',
    },
    processing: {
      label: 'Processing',
      icon: AlertCircle,
      color: 'bg-blue-100 text-blue-800',
      message: 'We are working on your portraits.',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      message: 'Your portraits are ready!',
    },
    cancelled: {
      label: 'Cancelled',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
      message: 'This order has been cancelled.',
    },
  };

  const StatusIcon = order ? statusConfig[order.status].icon : Clock;

  return (
    <Layout>
      <section className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {!order ? (
            <Card>
              <CardHeader>
                <CardTitle>Check Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Enter your order ID or email address to check the status of your order.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Order ID</label>
                    <Input
                      placeholder="Enter order ID"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSearch} disabled={loading || searching} className="w-full">
                    {loading || searching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Check Status'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Status</CardTitle>
                    <Badge className={statusConfig[order.status].color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[order.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{statusConfig[order.status].message}</p>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <Package size={14} />
                        Package
                      </p>
                      <p className="font-medium">{order.package_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <Calendar size={14} />
                        Order Date
                      </p>
                      <p className="font-medium">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="font-semibold text-lg">${order.price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {finalImages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Portraits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {finalImages.map((image) => (
                        <a
                          key={image.id}
                          href={image.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={image.image_url}
                            alt="Portrait"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button asChild className="w-full">
                        <Link to={`/download?order_id=${order.id}`}>Download All Portraits</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {order.status === 'processing' && finalImages.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Your portraits are being processed. We'll send you an email when they're
                      ready!
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setOrder(null)}>
                  Check Another Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
