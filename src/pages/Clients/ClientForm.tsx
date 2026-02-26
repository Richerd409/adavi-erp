import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Save, User, MapPin, AlignLeft, Trash2 } from 'lucide-react';

type ClientInsert = Database['public']['Tables']['clients']['Insert'];

const ClientForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState<ClientInsert>({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClient = async (clientId: string) => {
            try {
                const { data, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', clientId)
                    .single();

                if (error) throw error;
                if (data) {
                    setFormData({
                        name: data.name,
                        phone: data.phone,
                        email: data.email || '',
                        address: data.address || '',
                        notes: data.notes || ''
                    });
                }
            } catch (err: unknown) {
                console.error('Error fetching client:', err);
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

                // Fallback for demo
                if (errorMessage.includes('does not exist')) {
                    setError("Setup Note: The 'clients' table needs to be created in Supabase.");
                }
            } finally {
                setInitialLoading(false);
            }
        };

        if (isEditing && id) {
            fetchClient(id);
        }
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                const { error: updateError } = await supabase
                    .from('clients')
                    .update(formData)
                    .eq('id', id || '');
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('clients')
                    .insert([formData]);
                if (insertError) throw insertError;
            }

            navigate('/app/clients');
        } catch (err: unknown) {
            console.error('Error saving client:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save client';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this client? This cannot be undone.')) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id || '');

            if (error) throw error;
            navigate('/app/clients');
        } catch (err: unknown) {
            console.error('Error deleting client:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete client';
            setError(errorMessage);
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/app/clients">
                    <Button variant="outline" className="p-2 border-white/10 hover:bg-white/5">
                        <ArrowLeft className="w-5 h-5 text-text-muted hover:text-white" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                        {isEditing ? 'Edit Client Profile' : 'New Client'}
                    </h1>
                    <p className="text-sm text-text-muted">
                        {isEditing ? 'Update customer information' : 'Add a new customer to your database'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Card className="p-8 border-white/5 bg-gradient-to-b from-surface to-surface/40">
                    <div className="space-y-8">

                        {/* Core Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-white/10 pb-2">
                                <User className="w-5 h-5 text-primary" />
                                Basic Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <Input
                                    label="Full Name *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Jane Smith"
                                />
                                <Input
                                    label="Phone Number *"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. +1 234 567 8900"
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-white/10 pb-2">
                                <MapPin className="w-5 h-5 text-accent" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 pt-2">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. jane@example.com"
                                />
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">
                                        Billing/Shipping Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-black/40 rounded-xl p-3 text-sm text-white outline-none transition-all resize-none shadow-inner"
                                        placeholder="Full street address..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2 border-b border-white/10 pb-2">
                                <AlignLeft className="w-5 h-5 text-text-muted" />
                                Internal Notes
                            </h3>
                            <div className="pt-2">
                                <textarea
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-black/40 rounded-xl p-3 text-sm text-white outline-none transition-all resize-none shadow-inner"
                                    placeholder="Preferences, measurements summary, VIP status..."
                                />
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Actions Bottom Bar */}
                <div className="mt-6 flex items-center justify-between">
                    {isEditing ? (
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            loading={loading}
                            className="px-6"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Client
                        </Button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    <div className="flex gap-4">
                        <Link to="/app/clients">
                            <Button type="button" variant="outline" className="px-6 bg-white/5 border-white/10">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" loading={loading} className="px-8 shadow-neon">
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Save Changes' : 'Create Client'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
