import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRoom from './pages/AddRoom';
import AddMess from './pages/AddMess';
import Explore from './pages/Explore';
import ListingDetails from './pages/ListingDetails';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import RoomOwnerDashboard from './pages/RoomOwnerDashboard';
import MessOwnerDashboard from './pages/MessOwnerDashboard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          
          {/* Dashboard Route Redirector (Optional) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          {/* Specialized Dashboards */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/owner/room-dashboard" element={
            <ProtectedRoute allowedRoles={['RoomOwner', 'Admin']}>
              <RoomOwnerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/owner/mess-dashboard" element={
            <ProtectedRoute allowedRoles={['MessOwner', 'Admin']}>
              <MessOwnerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Addition Pages */}
          <Route path="/owner/add-room" element={
            <ProtectedRoute allowedRoles={['RoomOwner', 'Admin']}>
              <AddRoom />
            </ProtectedRoute>
          } />
          <Route path="/owner/add-mess" element={
            <ProtectedRoute allowedRoles={['MessOwner', 'Admin']}>
              <AddMess />
            </ProtectedRoute>
          } />

          {/* Fallback for old routes */}
          <Route path="/owner/dashboard" element={<Navigate to="/dashboard" replace />} />

        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
    </BrowserRouter>
  );
}

// Simple Helper to redirect to the correct specific dashboard
const DashboardRedirect = () => {
    const { user } = React.useContext(AuthContext);
    if (!user) return <Navigate to="/login" />;
    
    switch(user.role) {
        case 'Admin': return <Navigate to="/admin/dashboard" />;
        case 'Student': return <Navigate to="/student/dashboard" />;
        case 'RoomOwner': return <Navigate to="/owner/room-dashboard" />;
        case 'MessOwner': return <Navigate to="/owner/mess-dashboard" />;
        default: return <Navigate to="/" />;
    }
};

export default App;
