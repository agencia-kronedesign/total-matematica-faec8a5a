import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardContent from '@/components/dashboard/DashboardContent';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <AppLayout title="Total Matemática">
        <DashboardContent />
      </AppLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
