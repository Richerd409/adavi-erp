import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Loader2, Plus, Search, Ruler } from 'lucide-react';

type Measurement = Database['public']['Tables']['measurements']['Row'];

const MeasurementsList: React.FC = () => {
  const { user, role } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (role === 'admin' || role === 'manager')) {
      fetchMeasurements();
    }
  }, [user, role]);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching measurements:', error);
      } else {
        setMeasurements(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeasurements = measurements.filter(m =>
    m.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  if (role === 'tailor') {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">You do not have permission to view this page.</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-serif font-bold text-primary">Measurements</h1>
          <p className="text-text-muted mt-1">Client body measurements database.</p>
        </div>
        <Button onClick={() => navigate('/app/measurements/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Measurement
        </Button>
      </div>

      <Card className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <Input
            placeholder="Search by client name or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeasurements.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed border-muted">
            <p className="text-text-muted">No measurements found.</p>
          </div>
        ) : (
          filteredMeasurements.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(`/app/measurements/${m.id}`)}
              className="bg-white p-6 rounded-xl border border-muted shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-muted/50 rounded-full text-primary">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-primary group-hover:text-blue-600 transition-colors">
                    {m.client_name}
                  </h3>
                  <p className="text-sm text-text-muted">{m.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm text-text-muted">
                <div>Chest: {m.chest || '-'}</div>
                <div>Waist: {m.waist || '-'}</div>
                <div>Hip: {m.hip || '-'}</div>
                <div>Shoulder: {m.shoulder || '-'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeasurementsList;
