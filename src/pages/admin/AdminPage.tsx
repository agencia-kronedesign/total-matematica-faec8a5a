import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import AppLayout from '@/components/layout/AppLayout';

interface AdminPageProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ children, adminOnly = false }) => {
  return (
    <ProtectedRoute>
      <AdminRoute requiredRole={adminOnly ? ['admin'] : ['admin', 'direcao']}>
        <AppLayout title="Administração">
          {children}
        </AppLayout>
      </AdminRoute>
    </ProtectedRoute>
  );
};

export default AdminPage;
