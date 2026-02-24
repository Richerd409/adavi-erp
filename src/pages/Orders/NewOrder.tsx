import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { ArrowLeft, Save } from 'lucide-react';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { role, location } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderInsert>({
    client_name: '',
    phone: '',
    garment_type: '',
    delivery_date: '',
    notes: '',
    status: 'New',
    location: '', // Will be set on mount or change
  });

  useEffect(() => {
    if (role === 'tailor') {
      navigate('/app/orders');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (location) {
      setFormData(prev => ({ ...prev, location }));
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      navigate(`/app/orders/${data.id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Button>

      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">New Order</h1>
        <p className="text-text-muted mt-1">Create a new order for a client.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Client Name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            placeholder="e.g. John Doe"
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="e.g. +1 555 123 4567"
          />

          <Input
            label="Garment Type"
            name="garment_type"
            value={formData.garment_type}
            onChange={handleChange}
            required
            placeholder="e.g. 3-Piece Suit"
          />

          <Input
            label="Delivery Date"
            name="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={handleChange}
            required
          />

          {/* Location Selection - Only editable by Admin if needed, or just show it */}
          <div className="w-full">
            <label className="block text-sm font-medium text-text-muted mb-1">
              Location
            </label>
            {role === 'admin' ? (
               <Input
                 name="location"
                 value={formData.location || ''}
                 onChange={handleChange}
                 placeholder="Enter location (e.g., Downtown)"
               />
            ) : (
              <Input
                value={formData.location || 'Unassigned'}
                disabled
                className="bg-muted/10 text-text-muted"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-muted">Notes</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface text-text placeholder:text-text-muted/50"
              placeholder="Special instructions, fabric details, etc."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewOrder;
