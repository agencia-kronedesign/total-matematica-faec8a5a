import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

interface AdminPageProps {
  children: React.ReactNode;
}

const AdminPage: React.FC<AdminPageProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <DashboardSidebar />
            <div className="flex-1 bg-gray-50">
              {children}
            </div>
          </div>
        </SidebarProvider>
      </AdminRoute>
    </ProtectedRoute>
  );
};

export default AdminPage;