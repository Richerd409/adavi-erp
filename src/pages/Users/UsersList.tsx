import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield, UserPlus, X, Mail, Search, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

type User = Database['public']['Tables']['users']['Row'];
type UserRole = User['role'];

const UsersList: React.FC = () => {
   const { user, role } = useAuth();
   const [users, setUsers] = useState<User[]>([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [createLoading, setCreateLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [roleFilter, setRoleFilter] = useState<string>('all');
   const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      password: '',
      role: 'tailor' as UserRole,
      location: 'Unit 1'
   });
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

   const createUser = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         setCreateLoading(true);

         // Generate a dummy email if none is provided to satisfy Supabase auth requirements
         const finalEmail = newUser.email.trim() !== ''
            ? newUser.email
            : `${newUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(Math.random() * 1000)}@workshop.local`;

         const { error } = await supabase.functions.invoke('create-user', {
            body: { ...newUser, email: finalEmail }
         });

         if (error) throw error;

         alert('User created successfully. They can now log in.');
         setIsModalOpen(false);
         setNewUser({ name: '', email: '', password: '', role: 'tailor', location: 'Unit 1' });
         const { data: updatedUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false });
         if (updatedUsers) setUsers(updatedUsers);
      } catch (err) {
         console.error('Error creating user:', err);
         alert('Failed to create user. Make sure the Edge Function is deployed and you have permission.');
      } finally {
         setCreateLoading(false);
      }
   };

   const updateUserRole = async (userId: string, newRole: UserRole) => {
      if (userId === user?.id) return;
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

   const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
   });

   if (loading) {
      return (
         <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <div className="w-12 h-12 border-4 border-accent/20 border-b-accent rounded-full animate-spin absolute inset-2" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-fade-in pb-10 max-w-6xl mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
               <h1 className="text-3xl font-display font-bold text-white tracking-tight">Team Members</h1>
               <p className="text-text-muted mt-2 text-sm max-w-md">Manage your workshop staff, assign roles, and control system access levels.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-[0_0_20px_rgba(99,102,241,0.3)] w-full md:w-auto">
               <UserPlus className="w-5 h-5 mr-2" />
               Create User
            </Button>
         </div>

         <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center relative z-20">
            <div className="relative group flex-1 w-full max-w-sm">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-5 h-5" />
               <input
                  placeholder="Search name or email..."
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-text-muted outline-none transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto hide-scrollbar">
               {['all', 'admin', 'manager', 'tailor'].map(r => (
                  <button
                     key={r}
                     onClick={() => setRoleFilter(r)}
                     className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
                        roleFilter === r ? "bg-white/10 text-white shadow-sm" : "text-text-muted hover:text-white"
                     )}
                  >
                     {r}
                  </button>
               ))}
            </div>
         </div>

         <div className="table-container animate-fade-in relative z-10">
            <table className="table-premium">
               <thead>
                  <tr>
                     <th>User Details</th>
                     <th>Role & Access</th>
                     <th>Status</th>
                     <th>Joined Date</th>
                     <th className="text-right">Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredUsers.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="py-12 text-center text-text-muted">No members found matching your criteria.</td>
                     </tr>
                  ) : (
                     filteredUsers.map((u) => (
                        <tr key={u.id} className="group hover:bg-white/[0.03]">
                           <td>
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white font-display font-bold shadow-lg">
                                    {u.name.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <div className="font-medium text-white">{u.name}</div>
                                    <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                                       <Mail className="w-3 h-3" />
                                       {u.email || 'No email provided'}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td>
                              <div className="flex items-center gap-2">
                                 {u.id === user?.id ? (
                                    <Badge variant="default" className="capitalize bg-primary/20 text-primary border-primary/30">
                                       {u.role} (You)
                                    </Badge>
                                 ) : (
                                    <select
                                       className="bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-32 p-2 capitalize outline-none"
                                       value={u.role}
                                       onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                                    >
                                       <option value="admin" className="bg-surface text-text">Admin</option>
                                       <option value="manager" className="bg-surface text-text">Manager</option>
                                       <option value="tailor" className="bg-surface text-text">Tailor</option>
                                    </select>
                                 )}
                                 {u.role === 'admin' && <Shield className="w-4 h-4 text-primary drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" />}
                              </div>
                           </td>
                           <td>
                              <div className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_5px_theme(colors.success)]"></span>
                                 <span className="text-xs font-medium text-text-muted">Active</span>
                              </div>
                           </td>
                           <td className="text-sm text-text-muted">
                              {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                           </td>
                           <td className="text-right pr-6">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors" disabled={u.id === user?.id}>
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors" disabled={u.id === user?.id}>
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {/* Premium Create User Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
               <div className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setIsModalOpen(false)}></div>

               <div className="glass-card w-full max-w-md relative z-10 animate-slide-up overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                  <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-20">
                     <div>
                        <h2 className="text-xl font-display font-bold text-white">Create New User</h2>
                        <p className="text-xs text-text-muted mt-1">Directly create a new user account with workshop access.</p>
                     </div>
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-6 relative z-20">
                     <form onSubmit={createUser} className="space-y-4">
                        <div>
                           <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                           <input
                              className="input-premium"
                              placeholder="e.g. Jane Smith"
                              value={newUser.name}
                              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Email Address (Optional)</label>
                           <input
                              type="email"
                              className="input-premium"
                              placeholder="name@company.com"
                              value={newUser.email}
                              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                           />
                           <p className="text-[10px] text-text-muted mt-1">If left blank, a system email will be generated automatically.</p>
                        </div>

                        <div>
                           <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Password</label>
                           <input
                              type="text"
                              className="input-premium font-mono"
                              placeholder="••••••••"
                              value={newUser.password}
                              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                              required
                           />
                        </div>

                        <div>
                           <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Role Access</label>
                           <div className="relative">
                              <select
                                 value={newUser.role}
                                 onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                 className="input-premium appearance-none py-3"
                              >
                                 <option value="tailor" className="bg-surface text-text">Tailor Component Access</option>
                                 <option value="manager" className="bg-surface text-text">Manager Full Access</option>
                                 <option value="admin" className="bg-surface text-text">Administrator Override</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Workshop Location</label>
                           <div className="relative">
                              <select
                                 value={newUser.location || 'Unit 1'}
                                 onChange={e => setNewUser({ ...newUser, location: e.target.value })}
                                 className="input-premium appearance-none py-3"
                              >
                                 <option value="Unit 1" className="bg-surface text-text">Workshop Unit 1</option>
                                 <option value="Unit 2" className="bg-surface text-text">Workshop Unit 2</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
                           </div>
                        </div>

                        <div className="pt-6 flex gap-3">
                           <Button
                              type="button"
                              variant="secondary"
                              className="flex-1"
                              onClick={() => setIsModalOpen(false)}
                           >
                              Cancel
                           </Button>
                           <Button
                              type="submit"
                              className="flex-1 group"
                           >
                              {createLoading ? (
                                 <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                 <>Create Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                              )}
                           </Button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

// Add ArrowRight since I used it above
const ArrowRight = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
)

export default UsersList;
