import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrdersList from './pages/Orders/OrdersList';
import OrderDetail from './pages/Orders/OrderDetail';
import NewOrder from './pages/Orders/NewOrder';
import MeasurementsList from './pages/Measurements/MeasurementsList';
import MeasurementForm from './pages/Measurements/MeasurementForm';
import UsersList from './pages/Users/UsersList';
import FinanceList from './pages/Finance/FinanceList';
import ClientsList from './pages/Clients/ClientsList';
import ClientForm from './pages/Clients/ClientForm';

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Authenticated) */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="orders" element={<OrdersList />} />
              <Route path="orders/new" element={<NewOrder />} />
              <Route path="orders/:id" element={<OrderDetail />} />

              <Route path="measurements" element={<MeasurementsList />} />
              <Route path="measurements/new" element={<MeasurementForm />} />
              <Route path="measurements/:id" element={<MeasurementForm />} />

              <Route path="clients" element={<ClientsList />} />
              <Route path="clients/new" element={<ClientForm />} />
              <Route path="clients/:id" element={<ClientForm />} />

              {/* Admin Only Route */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="users" element={<UsersList />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="finance" element={<FinanceList />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
