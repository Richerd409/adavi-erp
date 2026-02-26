import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Card, CardContent } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Package, ArrowRight, MoreHorizontal, TrendingUp } from 'lucide-react';
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'New': return { color: 'border-l-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'In Progress': return { color: 'border-l-yellow-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'Trial': return { color: 'border-l-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'Alteration': return { color: 'border-l-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'Completed': return { color: 'border-l-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]', badge: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'Delivered': return { color: 'border-l-gray-500', glow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]', badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
      default: return { color: 'border-l-gray-500', glow: '', badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
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
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-secondary/20 border-b-secondary rounded-full animate-spin absolute inset-0 style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}"></div>
         </div>
      </div>
    );
  }

  const stats = kpiStats();
  const orderGroups = groupOrdersByStatus();

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Overview</h1>
          <p className="text-text-muted mt-1 text-sm">Welcome back, {role}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary text-sm">Download Report</button>
           <button className="btn-primary text-sm flex items-center gap-2" onClick={() => navigate('/app/orders/new')}>
              <TrendingUp className="w-4 h-4" />
              New Order
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: 'Total Orders', value: stats.total, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Active Orders', value: stats.active, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
          { title: 'Delivered', value: stats.delivered, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' }
        ].map((stat, i) => (
          <Card key={i} className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 blur-2xl`} />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl border border-white/5", stat.bg, stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex space-x-1">
                   {[1,2,3].map(dot => <div key={dot} className="w-1 h-1 bg-white/20 rounded-full" />)}
                </div>
              </div>
              <div>
                <h3 className="text-text-muted text-sm font-medium">{stat.title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-display font-bold text-white">{stat.value}</span>
                  <span className="text-xs font-medium text-success flex items-center">
                    +12% <ArrowRight className="w-3 h-3 ml-0.5 -rotate-45" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-display font-semibold text-white">Production Pipeline</h2>
           <button className="text-sm text-primary hover:text-primary-hover font-medium transition-colors flex items-center gap-1">
              View All Pipeline <ArrowRight className="w-4 h-4" />
           </button>
        </div>
        
        <div className="overflow-x-auto pb-6 hide-scrollbar">
          <div className="flex gap-6 min-w-max px-1">
            {Object.entries(orderGroups).map(([status, items]) => (
              <div key={status} className="w-[320px] shrink-0 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-4 bg-surface/50 backdrop-blur-md px-4 py-3 rounded-xl border border-white/5 shadow-glass">
                  <div className="flex items-center gap-2">
                     <h3 className="text-sm font-semibold text-white tracking-wide">{status}</h3>
                     <span className="bg-white/10 text-text px-2 py-0.5 rounded-full text-xs font-bold border border-white/10">
                       {items.length}
                     </span>
                  </div>
                  <button className="text-text-muted hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {items.map((order, idx) => {
                    const config = getStatusConfig(order.status || 'New');
                    return (
                      <div
                        key={order.id}
                        onClick={() => navigate(`/app/orders/${order.id}`)}
                        className={cn(
                          "bg-surface/80 backdrop-blur-md p-5 rounded-2xl border-l-4 border-y border-r border-y-white/5 border-r-white/5 cursor-pointer transition-all duration-300 hover:bg-surface-hover hover:-translate-y-1 relative group overflow-hidden",
                          config.color
                        )}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                         {/* Hover Glow */}
                         <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", config.glow)} />
                         
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-white group-hover:text-primary transition-colors text-base">{order.client_name}</h4>
                            <span className={cn('text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wider font-bold border', config.badge)}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted mb-4 font-light">{order.garment_type}</p>
                          
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                             <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-400 font-bold">TC</div>
                                <div className="w-6 h-6 rounded-full bg-surface border border-white/20 flex items-center justify-center text-[10px] text-text-muted z-10">+{Math.floor(Math.random() * 3) + 1}</div>
                             </div>
                             <div className="flex items-center text-xs text-text-muted bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(order.delivery_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 mx-1">
                      <Package className="w-6 h-6 text-text-muted/50 mb-2" />
                      <p className="text-xs font-medium text-text-muted/50 uppercase tracking-widest">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
