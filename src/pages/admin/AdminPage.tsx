import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import AppLayout from '@/components/layout/AppLayout';

interface AdminPageProps {
  children: React.ReactNode;
}

const AdminPage: React.FC<AdminPageProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <AdminRoute requiredRole={['admin']}>
        <AppLayout title="Administração">
          {children}
        </AppLayout>
      </AdminRoute>
    </ProtectedRoute>
  );
};

export default AdminPage;
