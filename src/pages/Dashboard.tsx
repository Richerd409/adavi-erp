import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

type Order = Database['public']['Tables']['orders']['Row'];

const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let query = supabase.from('orders').select('*');

        if (role === 'tailor' && user) {
          query = query.eq('assigned_tailor_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching orders:', error);
        } else {
          setOrders(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, role]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Trial': return 'bg-purple-100 text-purple-800';
      case 'Alteration': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupOrdersByStatus = () => {
    const statuses = ['New', 'In Progress', 'Trial', 'Alteration', 'Completed', 'Delivered'];
    const groups: { [key: string]: Order[] } = {};
    statuses.forEach(status => groups[status] = []);
    orders.forEach(order => {
      const status = order.status || 'New';
      if (!groups[status]) {
          groups[status] = [];
      }
      groups[status].push(order);
    });
    return groups;
  };

  const kpiStats = () => {
    const total = orders.length;
    const active = orders.filter(o => !['Completed', 'Delivered'].includes(o.status || '')).length;
    const completed = orders.filter(o => o.status === 'Completed').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    return { total, active, completed, delivered };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = kpiStats();
  const orderGroups = groupOrdersByStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Dashboard</h1>
        <p className="text-text-muted mt-2">Welcome back, {role}. Here is an overview of your workshop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center justify-center py-8">
          <h3 className="text-4xl font-bold text-primary">{stats.total}</h3>
          <p className="text-text-muted mt-2">Total Orders</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8 border-l-4 border-l-blue-500">
          <h3 className="text-4xl font-bold text-blue-600">{stats.active}</h3>
          <p className="text-text-muted mt-2">Active Orders</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8 border-l-4 border-l-green-500">
          <h3 className="text-4xl font-bold text-green-600">{stats.completed}</h3>
          <p className="text-text-muted mt-2">Completed</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8 border-l-4 border-l-gray-500">
          <h3 className="text-4xl font-bold text-gray-600">{stats.delivered}</h3>
          <p className="text-text-muted mt-2">Delivered</p>
        </Card>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[1200px] p-1">
          {Object.entries(orderGroups).map(([status, items]) => (
            <div key={status} className="flex-1 min-w-[280px]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-medium text-text">{status}</h3>
                <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-text-muted">
                  {items.length}
                </span>
              </div>
              <div className="space-y-4">
                {items.map(order => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/app/orders/${order.id}`)}
                    className="bg-white p-4 rounded-lg border border-muted shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-primary truncate group-hover:text-blue-600 transition-colors">{order.client_name}</h4>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2', getStatusColor(order.status || 'New'))}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mb-2">{order.garment_type}</p>
                    <div className="flex justify-between items-center text-xs text-text-muted border-t border-muted pt-2 mt-2">
                      <span>Due: {new Date(order.delivery_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-muted mx-1">
                    <p className="text-xs text-text-muted">No orders</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
