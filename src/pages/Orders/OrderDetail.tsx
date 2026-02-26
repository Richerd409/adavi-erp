import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader2, ArrowLeft, User, Calendar, FileText, Ruler } from 'lucide-react';
import { format } from 'date-fns';

type Order = Database['public']['Tables']['orders']['Row'];
type User = Database['public']['Tables']['users']['Row'];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [tailors, setTailors] = useState<User[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [measurement, setMeasurement] = useState<Database['public']['Tables']['measurements']['Row'] | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*, measurements(*)')
          .eq('id', id!)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
        } else {
          setOrder(data);
          if (data.measurements) {
            setMeasurement(data.measurements);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTailors = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'tailor');

      if (data) setTailors(data);
    };

    if (id) {
      fetchOrder();
      if (role === 'admin' || role === 'manager') {
        fetchTailors();
      }
    }
  }, [id, role]);

  const updateStatus = async (newStatus: Order['status']) => {
    if (!order) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please check permissions or valid transitions.');
    }
  };

  const assignTailor = async (tailorId: string) => {
    if (!order) return;
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ assigned_tailor_id: tailorId })
        .eq('id', order.id);

      if (error) throw error;
      setOrder({ ...order, assigned_tailor_id: tailorId });
    } catch (err) {
      console.error('Error assigning tailor:', err);
      alert('Failed to assign tailor.');
    } finally {
      setAssigning(false);
    }
  };

  const getNextStatuses = (current: Order['status']): Order['status'][] => {
    const flow: Order['status'][] = ['New', 'In Progress', 'Trial', 'Alteration', 'Completed', 'Delivered'];
    const index = flow.indexOf(current);
    if (index === -1 || index === flow.length - 1) return [];

    // Special case: Trial can go to Alteration OR Completed
    if (current === 'Trial') {
      return ['Alteration', 'Completed'];
    }

    return [flow[index + 1]];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  const nextStatuses = getNextStatuses(order.status);
  const isOwner = user?.id === order.assigned_tailor_id;
  const isAdminOrManager = role === 'admin' || role === 'manager';
  const canUpdateStatus = isAdminOrManager || isOwner;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-text-muted mt-1">Created on {order.created_at ? format(new Date(order.created_at), 'PPP') : 'N/A'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {order.status}
          </Badge>
          {canUpdateStatus && nextStatuses.map((next) => (
            <Button key={next} onClick={() => updateStatus(next)}>
              Move to {next}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Client Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted uppercase font-bold">Name</label>
                <p className="text-lg">{order.client_name}</p>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase font-bold">Phone</label>
                <p className="text-lg">{order.phone || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Order Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted uppercase font-bold">Garment Type</label>
                <p className="text-lg">{order.garment_type}</p>
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase font-bold">Notes</label>
                <p className="whitespace-pre-wrap text-text-muted bg-muted/20 p-3 rounded-lg border border-muted/50">
                  {order.notes || 'No notes provided.'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Timeline
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-text-muted uppercase font-bold">Delivery Date</label>
                <p className="font-semibold text-primary">
                  {order.delivery_date ? format(new Date(order.delivery_date), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Ruler className="w-5 h-5 mr-2" />
                Measurements
              </h3>
              {measurement?.measurement_number && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                  {measurement.measurement_number}
                </span>
              )}
            </div>
            {measurement ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold block mb-0.5">Shoulder</label>
                  <p>{measurement.shoulder || '—'} <span className="text-[10px] text-text-muted">{measurement.unit || ''}</span></p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold block mb-0.5">Chest</label>
                  <p>{measurement.chest || '—'} <span className="text-[10px] text-text-muted">{measurement.unit || ''}</span></p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold block mb-0.5">Waist</label>
                  <p>{measurement.waist || '—'} <span className="text-[10px] text-text-muted">{measurement.unit || ''}</span></p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold block mb-0.5">Hip</label>
                  <p>{measurement.hip || '—'} <span className="text-[10px] text-text-muted">{measurement.unit || ''}</span></p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold block mb-0.5">Sleeve</label>
                  <p>{measurement.sleeve_length || '—'} <span className="text-[10px] text-text-muted">{measurement.unit || ''}</span></p>
                </div>
                <div>
                  <label className="text-xs text-text-muted uppercase font-bold block mb-0.5">Top</label>
                  <p>{measurement.top_length || '—'} <span className="text-[10px] text-text-muted">{measurement.unit || ''}</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-text-muted">No measurements linked.</p>
              </div>
            )}
          </Card>

          {(role === 'admin' || role === 'manager') && (
            <Card>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Assigned Tailor
              </h3>
              <select
                className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface"
                value={order.assigned_tailor_id || ''}
                onChange={(e) => assignTailor(e.target.value)}
                disabled={assigning}
              >
                <option value="">Unassigned</option>
                {tailors.map((tailor) => (
                  <option key={tailor.id} value={tailor.id}>
                    {tailor.name}
                  </option>
                ))}
              </select>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
