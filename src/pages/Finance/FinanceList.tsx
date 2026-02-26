import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Loader2, Banknote, Search, Filter, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Invoice } from './Invoice';

const FinanceList: React.FC = () => {
    const { user, role } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (user && (role === 'admin' || role === 'manager')) {
            fetchInvoices();
        } else if (user && role === 'tailor') {
            navigate('/app/dashboard');
        }
    }, [user, role, navigate]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          order:orders (
            client_name
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvoices(data as Invoice[]);
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4 text-success" />;
            case 'partially_paid': return <Clock className="w-4 h-4 text-warning" />;
            case 'unpaid': return <AlertCircle className="w-4 h-4 text-error" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-success bg-success/10';
            case 'partially_paid': return 'text-warning bg-warning/10';
            case 'unpaid': return 'text-error bg-error/10';
            default: return 'text-text-muted bg-muted/10';
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.order?.client_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Finance</h1>
                    <p className="text-text-muted mt-1">Manage invoices, payments, and boutique revenue.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Banknote className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Total Revenue</p>
                            <p className="text-2xl font-bold text-primary">
                                ₦{invoices.filter(i => i.status !== 'cancelled').reduce((acc, i) => acc + Number(i.paid_amount), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 text-warning">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-warning/10 rounded-full">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Pending Balance</p>
                            <p className="text-2xl font-bold">
                                ₦{invoices.filter(i => i.status !== 'cancelled').reduce((acc, i) => acc + (Number(i.total_amount) - Number(i.paid_amount)), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 text-success">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success/10 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Paid Invoices</p>
                            <p className="text-2xl font-bold">
                                {invoices.filter(i => i.status === 'paid').length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search invoice number or client name..."
                        className="w-full pl-10 pr-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                        <select
                            className="w-full pl-9 pr-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-surface appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="partially_paid">Partially Paid</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-muted">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-primary">Invoice #</th>
                                <th className="px-6 py-4 font-semibold text-primary">Client</th>
                                <th className="px-6 py-4 font-semibold text-primary">Total Amount</th>
                                <th className="px-6 py-4 font-semibold text-primary">Paid</th>
                                <th className="px-6 py-4 font-semibold text-primary">Status</th>
                                <th className="px-6 py-4 font-semibold text-primary">Due Date</th>
                                <th className="px-6 py-4 font-semibold text-primary">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4 font-medium">{invoice.invoice_number}</td>
                                        <td className="px-6 py-4">{invoice.order?.client_name || 'N/A'}</td>
                                        <td className="px-6 py-4">₦{Number(invoice.total_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">₦{Number(invoice.paid_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                {getStatusIcon(invoice.status)}
                                                {invoice.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/app/orders/${invoice.order_id}`)}
                                            >
                                                View Order
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinanceList;
