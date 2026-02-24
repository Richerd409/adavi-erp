import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { Loader2, Shield, MapPin } from 'lucide-react';

type User = Database['public']['Tables']['users']['Row'];
type UserRole = User['role'];

const UsersList: React.FC = () => {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setUsers(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (role && role !== 'admin') {
      navigate('/app/dashboard');
      return;
    }
    if (user && role === 'admin') {
      fetchUsers();
    }
  }, [user, role, navigate]);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update user role.');
    }
  };

  const updateUserLocation = async (userId: string, newLocation: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ location: newLocation })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, location: newLocation } : u));
    } catch (err) {
      console.error('Error updating location:', err);
      alert('Failed to update user location.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Users</h1>
        <p className="text-text-muted mt-1">Manage system access, roles, and locations.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-muted">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-muted">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {u.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-transparent border border-muted"
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        disabled={u.id === user?.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="tailor">Tailor</option>
                      </select>
                      {u.role === 'admin' && <Shield className="w-4 h-4 text-primary" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 max-w-[150px]">
                      <MapPin className="w-4 h-4 text-text-muted" />
                      <input
                        className="w-full bg-transparent border-b border-muted focus:border-primary focus:outline-none text-sm py-1"
                        defaultValue={u.location || ''}
                        placeholder="Assign Location"
                        onBlur={(e) => {
                            if (e.target.value !== u.location) {
                                updateUserLocation(u.id, e.target.value);
                            }
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersList;
