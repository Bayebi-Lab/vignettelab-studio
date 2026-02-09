import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LogOut, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
}

export default function AdminDashboard() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status');

      if (error) throw error;

      const stats: OrderStats = {
        total: orders?.length || 0,
        pending: orders?.filter((o) => o.status === 'pending').length || 0,
        processing: orders?.filter((o) => o.status === 'processing').length || 0,
        completed: orders?.filter((o) => o.status === 'completed').length || 0,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
    toast.success('Signed out successfully');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Welcome back, {admin?.email}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Processing</h3>
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button asChild size="lg">
                    <Link to="/admin/orders">View All Orders</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
