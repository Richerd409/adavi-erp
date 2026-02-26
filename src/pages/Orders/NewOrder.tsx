import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Save, Ruler, User, Info, Package } from 'lucide-react';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type MeasurementInsert = Database['public']['Tables']['measurements']['Insert'];

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);

  const [orderData, setOrderData] = useState<OrderInsert>({
    client_name: '',
    phone: '',
    garment_type: '',
    delivery_date: '',
    notes: '',
    status: 'New',
    assigned_tailor_id: null,
    measurement_id: null,
  });

  const [measurementData, setMeasurementData] = useState<MeasurementInsert>({
    client_name: '',
    phone: '',
    shoulder: '',
    chest: '',
    waist: '',
    hip: '',
    sleeve_length: '',
    top_length: '',
    unit: 'inches',
    notes: '',
    measurement_number: '',
  });

  const [totalAmount, setTotalAmount] = useState<string>('');
  const [tailors, setTailors] = useState<Database['public']['Tables']['users']['Row'][]>([]);
  const [clients, setClients] = useState<Database['public']['Tables']['clients']['Row'][]>([]);

  useEffect(() => {
    if (role === 'tailor') {
      navigate('/app/orders');
      return;
    }

    const fetchData = async () => {
      const { data: tailorData } = await supabase.from('users').select('*').eq('role', 'tailor');
      if (tailorData) setTailors(tailorData);

      // Fetch clients for dropdown
      const { data: clientData } = await supabase.from('clients').select('*').order('name');
      if (clientData) setClients(clientData);
    };

    fetchData();

    if (!measurementData.measurement_number) {
      setMeasurementData(prev => ({
        ...prev,
        measurement_number: `M-${Date.now().toString().slice(-6)}`
      }));
    }
  }, [role, navigate, measurementData.measurement_number]);

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle selecting an existing client
    if (name === 'selected_client') {
      const client = clients.find(c => c.id === value);
      if (client) {
        setOrderData(prev => ({ ...prev, client_name: client.name, phone: client.phone }));
        setMeasurementData(prev => ({ ...prev, client_name: client.name, phone: client.phone }));
      }
      return;
    }

    setOrderData(prev => ({ ...prev, [name]: value }));
    // Sync client name and phone to measurement data as well
    if (name === 'client_name' || name === 'phone') {
      setMeasurementData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMeasurementData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Measurement First
      const { data: mData, error: mError } = await supabase
        .from('measurements')
        .insert([measurementData])
        .select()
        .single();

      if (mError) throw mError;

      // 2. Create Order with linked measurement_id
      const { data: oData, error: oError } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          measurement_id: mData.id
        }])
        .select()
        .single();

      if (oError) throw oError;

      // 3. Create Invoice
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      await supabase
        .from('invoices')
        .insert({
          order_id: oData.id,
          invoice_number: invoiceNumber,
          total_amount: Number(totalAmount) || 0,
          status: 'unpaid',
          due_date: orderData.delivery_date
        });

      navigate(`/app/orders/${oData.id}`);
    } catch (err) {
      console.error('Error creating order flow:', err);
      alert('Failed to create order. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Create <span className="text-primary">Order</span></h1>
          <p className="text-text-muted mt-2">Initialize a new production cycle with integrated measurements.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Draft Mode</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client & Order Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold text-white">Client Information</h2>
            </div>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider ml-1 mb-1.5">
                  Select Existing Client (Optional)
                </label>
                <select
                  name="selected_client"
                  onChange={handleOrderChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="" className="bg-surface">-- Select a client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
              <Input
                label="Client Name"
                name="client_name"
                value={orderData.client_name}
                onChange={handleOrderChange}
                required
                placeholder="Full Name"
                className="bg-white/5 border-white/10"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={orderData.phone || ''}
                onChange={handleOrderChange}
                placeholder="Primary Contact"
                className="bg-white/5 border-white/10"
              />
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-bold text-white">Order Particulars</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Garment Type"
                  name="garment_type"
                  value={orderData.garment_type}
                  onChange={handleOrderChange}
                  required
                  placeholder="e.g. Traditional Kaftan"
                  className="bg-white/5 border-white/10"
                />
                <Input
                  label="Total Amount (₦)"
                  name="total_amount"
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Delivery Date"
                  name="delivery_date"
                  type="date"
                  value={orderData.delivery_date}
                  onChange={handleOrderChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-white/5 border-white/10"
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Assign Workshop Staff</label>
                  <select
                    name="assigned_tailor_id"
                    value={orderData.assigned_tailor_id || ''}
                    onChange={(e) => setOrderData(prev => ({ ...prev, assigned_tailor_id: e.target.value || null }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="" className="bg-surface">Unassigned</option>
                    {tailors.map(t => (
                      <option key={t.id} value={t.id} className="bg-surface">{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">Production Notes</label>
                <textarea
                  name="notes"
                  value={orderData.notes || ''}
                  onChange={handleOrderChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Special style requests, fabric instructions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Integrated Measurements */}
        <div className="space-y-8">
          <Card className="glass-card overflow-hidden sticky top-8 border-primary/20 bg-primary/5">
            <div className="p-6 border-b border-white/5 bg-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-white">Body Metrics</h2>
              </div>
              <select
                name="unit"
                value={measurementData.unit || 'inches'}
                onChange={handleMeasurementChange}
                className="bg-primary/20 border border-primary/30 text-xs font-bold text-white px-2 py-1 rounded-lg outline-none cursor-pointer"
              >
                <option value="inches" className="bg-surface">IN</option>
                <option value="cm" className="bg-surface">CM</option>
              </select>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-text-muted uppercase">ID: {measurementData.measurement_number}</span>
                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">AUTO</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Shoulder"
                  name="shoulder"
                  value={measurementData.shoulder || ''}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  className="bg-white/5 border-white/10 text-center"
                />
                <Input
                  label="Chest"
                  name="chest"
                  value={measurementData.chest || ''}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  className="bg-white/5 border-white/10 text-center"
                />
                <Input
                  label="Waist"
                  name="waist"
                  value={measurementData.waist || ''}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  className="bg-white/5 border-white/10 text-center"
                />
                <Input
                  label="Hip"
                  name="hip"
                  value={measurementData.hip || ''}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  className="bg-white/5 border-white/10 text-center"
                />
                <Input
                  label="Sleeve Len"
                  name="sleeve_length"
                  value={measurementData.sleeve_length || ''}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  className="bg-white/5 border-white/10 text-center"
                />
                <Input
                  label="Top Len"
                  name="top_length"
                  value={measurementData.top_length || ''}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  className="bg-white/5 border-white/10 text-center"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-start gap-2 text-xs text-text-muted bg-white/5 p-3 rounded-xl border border-white/5">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <p>Measurements entered here will create a separate record and be permanently linked to this order.</p>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full btn-primary h-14 mt-4 text-lg font-bold shadow-neon group"
              >
                <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Initialize Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default NewOrder;
