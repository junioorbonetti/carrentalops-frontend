import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Rentals from './pages/Rentals';
import RentalDetail from './pages/RentalDetail';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import WeeklyPayments from './pages/WeeklyPayments';
import Trackers from './pages/Trackers';
import FleetMap from './pages/FleetMap';
import Catalog from './pages/Catalog';
import Leads from './pages/Leads';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a2d42', color: '#e8edf2', border: '1px solid rgba(255,255,255,0.1)' },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="vehicles/:id" element={<VehicleDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="rentals" element={<Rentals />} />
            <Route path="rentals/:id" element={<RentalDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="weekly" element={<WeeklyPayments />} />
            <Route path="trackers" element={<Trackers />} />
            <Route path="fleet" element={<FleetMap />} />
            <Route path="leads" element={<Leads />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}