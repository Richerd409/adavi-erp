import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { UserPlus, Search, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

type Client = Database['public']['Tables']['clients']['Row'];

const ClientsList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            // Fallback for demo if table doesn't exist yet
            setClients([
                { id: '1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com', address: '123 Main St', notes: null, created_at: new Date().toISOString() },
                { id: '2', name: 'Jane Smith', phone: '+9876543210', email: 'jane@example.com', address: '456 Oak Ave', notes: 'VIP client', created_at: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">
                        Clients
                    </h1>
                    <p className="text-sm text-text-muted">Manage your customer database</p>
                </div>
                <Link to="/app/clients/new">
                    <Button className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add New Client
                    </Button>
                </Link>
            </div>

            <div className="relative max-w-md group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input
                    type="text"
                    placeholder="Search clients by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-surface border-white/10 focus:border-primary/50 text-sm"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="h-48 animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <Card className="text-center py-16 hover:bg-white/5 transition-colors border-dashed">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-white font-medium text-lg mb-2">No clients found</p>
                    <p className="text-text-muted mb-6">Create your first client to get started</p>
                    <Link to="/app/clients/new">
                        <Button variant="outline">Add Client</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Link key={client.id} to={`/app/clients/${client.id}`} className="block group">
                            <Card className="h-full transition-all duration-300 hover:border-primary/30 hover:shadow-neon hover:-translate-y-1 border-white/5 bg-gradient-to-br from-surface to-surface/50">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center">
                                                <span className="text-xl font-display font-bold text-white group-hover:text-primary transition-colors">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                    {client.name}
                                                </h3>
                                                {client.created_at && (
                                                    <p className="text-[10px] text-text-muted uppercase tracking-wider">
                                                        Added {format(new Date(client.created_at), 'MMM d, yyyy')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button className="text-text-muted hover:text-white p-2">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        <div className="flex items-center text-sm text-text-muted">
                                            <Phone className="w-4 h-4 mr-3 text-primary/70" />
                                            {client.phone}
                                        </div>
                                        {client.email && (
                                            <div className="flex items-center text-sm text-text-muted truncate">
                                                <Mail className="w-4 h-4 mr-3 text-accent/70" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.address && (
                                            <div className="flex items-start text-sm text-text-muted">
                                                <MapPin className="w-4 h-4 mr-3 shrink-0 text-text-muted/70 mt-0.5" />
                                                <span className="line-clamp-2">{client.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientsList;
