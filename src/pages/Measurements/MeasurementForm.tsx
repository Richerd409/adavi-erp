import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';

type MeasurementInsert = Database['public']['Tables']['measurements']['Insert'];

const MeasurementForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState<MeasurementInsert>({
    client_name: '',
    phone: '',
    chest: '',
    waist: '',
    hip: '',
    shoulder: '',
    sleeve_length: '',
    top_length: '',
    notes: '',
  });

  const isEditMode = !!id;

  useEffect(() => {
    const fetchMeasurement = async () => {
      try {
        setFetching(true);
        const { data, error } = await supabase
          .from('measurements')
          .select('*')
          .eq('id', id!)
          .single();

        if (error) {
          console.error('Error fetching measurement:', error);
        } else {
          if (data) {
            setFormData({
              client_name: data.client_name,
              phone: data.phone,
              chest: data.chest || '',
              waist: data.waist || '',
              hip: data.hip || '',
              shoulder: data.shoulder || '',
              sleeve_length: data.sleeve_length || '',
              top_length: data.top_length || '',
              notes: data.notes || '',
            });
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setFetching(false);
      }
    };

    if (role === 'tailor') {
      navigate('/app/dashboard');
      return;
    }

    if (id) {
      fetchMeasurement();
    }
  }, [id, role, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('measurements')
          .update(formData)
          .eq('id', id!);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('measurements')
          .insert([formData]);

        if (error) throw error;
      }
      navigate('/app/measurements');
    } catch (err) {
      console.error('Error saving measurement:', err);
      alert('Failed to save measurement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', id!);

      if (error) throw error;
      navigate('/app/measurements');
    } catch (err) {
      console.error('Error deleting measurement:', err);
      alert('Failed to delete measurement.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to List
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">
            {isEditMode ? 'Edit Measurement' : 'New Measurement'}
          </h1>
          <p className="text-text-muted mt-1">
            {isEditMode ? 'Update client measurements.' : 'Record new client measurements.'}
          </p>
        </div>
        {isEditMode && (
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Client Name"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              required
              placeholder="Client Name"
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Phone Number"
            />
          </div>

          <div className="border-t border-muted my-6"></div>
          <h3 className="text-lg font-medium text-primary mb-4">Body Measurements</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Input
              label="Chest"
              name="chest"
              value={formData.chest || ''}
              onChange={handleChange}
              placeholder='e.g. 40"'
            />
            <Input
              label="Waist"
              name="waist"
              value={formData.waist || ''}
              onChange={handleChange}
              placeholder='e.g. 32"'
            />
            <Input
              label="Hip"
              name="hip"
              value={formData.hip || ''}
              onChange={handleChange}
              placeholder='e.g. 36"'
            />
            <Input
              label="Shoulder"
              name="shoulder"
              value={formData.shoulder || ''}
              onChange={handleChange}
              placeholder='e.g. 18"'
            />
            <Input
              label="Sleeve Length"
              name="sleeve_length"
              value={formData.sleeve_length || ''}
              onChange={handleChange}
              placeholder='e.g. 24"'
            />
            <Input
              label="Top Length"
              name="top_length"
              value={formData.top_length || ''}
              onChange={handleChange}
              placeholder='e.g. 28"'
            />
          </div>

          <div className="space-y-1 mt-4">
            <label className="block text-sm font-medium text-text-muted">Notes</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface text-text placeholder:text-text-muted/50"
              placeholder="Additional notes about posture, fit preference, etc."
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Measurement
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MeasurementForm;
