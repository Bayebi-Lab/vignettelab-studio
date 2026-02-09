import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { OrderCard } from '@/components/admin/OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_email: string;
  package_name: string;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer_email.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.package_name.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">Loading orders...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-8">
              All Orders
            </h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, order ID, or package..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-md border border-input bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
