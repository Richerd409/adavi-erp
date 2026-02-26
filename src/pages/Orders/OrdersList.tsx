import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader2, Plus, Search, Filter, MoreVertical, Calendar, Scissors, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderStatus = 'New' | 'In Progress' | 'Trial' | 'Alteration' | 'Completed' | 'Delivered' | 'Cancelled';

const OrdersList: React.FC = () => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let query = supabase.from('orders').select('*');

        if (role === 'tailor' && user) {
          query = query.eq('assigned_tailor_id', user.id);
        }

        if (searchTerm) {
          query = query.or(`client_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }

        if (statusFilter !== 'All') {
          query = query.eq('status', statusFilter as OrderStatus);
        }

        query = query.order('created_at', { ascending: false });

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
  }, [user, role, searchTerm, statusFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Delivered': return 'default';
      case 'New': return 'outline';
      case 'In Progress': return 'warning';
      case 'Trial': return 'secondary';
      case 'Alteration': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto pl-2">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Order Management</h1>
          <p className="text-text-muted mt-2 text-sm max-w-md">Overview and manage all client orders, track their status, and ensure timely delivery across your workshop.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {(role === 'admin' || role === 'manager') && (
            <Button onClick={() => navigate('/app/orders/new')} className="w-full md:w-auto shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Plus className="w-5 h-5 mr-2" />
              Create Order
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-20">
         <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                placeholder="Search clients or phones..."
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted outline-none transition-all shadow-inner focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-56 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-white transition-colors w-4 h-4 z-10" />
              <select
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl text-sm text-white appearance-none outline-none transition-all cursor-pointer relative z-0"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {['All', 'New', 'In Progress', 'Trial', 'Alteration', 'Completed', 'Delivered'].map(s => (
                  <option key={s} value={s} className="bg-surface text-text">{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted z-10">
                  <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
            </div>
         </div>
         
         <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
               onClick={() => setViewMode('table')}
               className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", viewMode === 'table' ? "bg-white/10 text-white shadow-sm" : "text-text-muted hover:text-white")}
            >
               Table
            </button>
            <button 
               onClick={() => setViewMode('grid')}
               className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-text-muted hover:text-white")}
            >
               Cards
            </button>
         </div>
      </div>

      {/* Data Visualization */}
      {orders.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
             <Search className="w-8 h-8 text-text-muted/50" />
          </div>
          <h3 className="text-lg font-display font-medium text-white mb-2">No orders found</h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto">We couldn't find any orders matching your current filters. Try changing your search terms.</p>
        </div>
      ) : (
        viewMode === 'table' ? (
           <div className="table-container animate-fade-in relative z-10">
              <table className="table-premium">
                 <thead>
                    <tr>
                       <th>Order ID</th>
                       <th>Client Details</th>
                       <th>Garment</th>
                       <th>Timeline</th>
                       <th>Status</th>
                       <th className="text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {orders.map((order) => (
                       <tr key={order.id} onClick={() => navigate(`/app/orders/${order.id}`)} className="group">
                          <td className="font-mono text-xs text-text-muted/70 group-hover:text-primary transition-colors">
                             #{order.id.split('-')[0]}
                          </td>
                          <td>
                             <div className="font-medium text-white group-hover:text-primary-hover transition-colors">{order.client_name}</div>
                             <div className="text-xs text-text-muted mt-0.5">{order.phone || 'No phone added'}</div>
                          </td>
                          <td>
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-white/5 border border-white/10 text-text-muted">
                                   <Scissors className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm text-text">{order.garment_type}</span>
                             </div>
                          </td>
                          <td>
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center text-xs text-text-muted">
                                   <span className="w-12 inline-block">Created:</span> 
                                   <span className="text-text">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-xs text-text-muted">
                                   <span className="w-12 inline-block">Due:</span> 
                                   <span className={cn("font-medium", new Date(order.delivery_date) < new Date() && order.status !== 'Delivered' ? 'text-error' : 'text-white')}>
                                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}
                                   </span>
                                </div>
                             </div>
                          </td>
                          <td>
                             <Badge variant={getStatusVariant(order.status || 'New')} className="uppercase tracking-wider text-[10px]">
                                {order.status}
                             </Badge>
                          </td>
                          <td className="text-right pr-6">
                             <button className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100">
                                <ChevronRight className="w-5 h-5" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in relative z-10">
             {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/app/orders/${order.id}`)}
                  className="glass-card p-5 cursor-pointer group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors duration-500" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                     <Badge variant={getStatusVariant(order.status || 'New')} className="uppercase tracking-wider text-[10px]">
                        {order.status}
                     </Badge>
                     <button className="text-text-muted group-hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="mb-4 relative z-10 flex-1">
                     <h3 className="font-display font-semibold text-lg text-white group-hover:text-primary transition-colors">{order.client_name}</h3>
                     <p className="text-sm text-text-muted flex items-center gap-2 mt-1">
                        <Scissors className="w-3.5 h-3.5" />
                        {order.garment_type}
                     </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                     <div className="flex items-center text-xs text-text-muted">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        Due {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                     </div>
                     <span className="text-[10px] font-mono text-text-muted border border-white/10 px-2 py-0.5 rounded bg-white/5">
                        #{order.id.split('-')[0]}
                     </span>
                  </div>
                </div>
             ))}
           </div>
        )
      )}
    </div>
  );
};

export default OrdersList;
