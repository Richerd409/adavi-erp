import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Loader2, Plus, Search, Filter } from 'lucide-react';

type Order = Database['public']['Tables']['orders']['Row'];

const OrdersList: React.FC = () => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phone && order.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Delivered': return 'default';
      case 'New': return 'outline';
      case 'In Progress': return 'warning';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Orders</h1>
          <p className="text-text-muted mt-1">Manage your workshop orders.</p>
        </div>
        {(role === 'admin' || role === 'manager') && (
          <Button onClick={() => navigate('/app/orders/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        )}
      </div>

      <Card className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <Input
            placeholder="Search by client name or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Trial">Trial</option>
              <option value="Alteration">Alteration</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
            </select>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-muted">
            <p className="text-text-muted">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/app/orders/${order.id}`)}
              className="bg-white p-6 rounded-xl border border-muted shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-lg text-primary group-hover:text-blue-600 transition-colors">
                    {order.client_name}
                  </h3>
                  <Badge variant={getStatusVariant(order.status || 'New')}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-text-muted space-y-1">
                  <p>{order.garment_type}</p>
                  <p>Due: {new Date(order.delivery_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                 <span className="text-xs text-text-muted block">Created {new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersList;
