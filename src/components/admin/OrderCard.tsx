import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowRight, Mail, Package } from 'lucide-react';

interface Order {
  id: string;
  customer_email: string;
  package_name: string;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Link to={`/admin/orders/${order.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Order #{order.id.slice(0, 8)}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={14} />
              <span>{order.customer_email}</span>
            </div>
          </div>
          <Badge className={statusColors[order.status]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package size={14} />
            <span>{order.package_name}</span>
            <span className="font-semibold text-foreground">${order.price.toFixed(2)}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), 'MMM d, yyyy')}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end text-primary">
          <span className="text-sm font-medium">View Details</span>
          <ArrowRight size={16} className="ml-1" />
        </div>
      </Card>
    </Link>
  );
}
