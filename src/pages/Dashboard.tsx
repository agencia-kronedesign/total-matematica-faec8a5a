import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardContent from '@/components/dashboard/DashboardContent';
import ProtectedRoute from '@/components/ProtectedRoute';


const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col bg-muted/30">
            <header className="h-14 flex items-center border-b bg-background px-4 sticky top-0 z-10 gap-4">
              <SidebarTrigger className="h-8 w-8" />
              <span className="font-semibold text-primary">Total Matemática</span>
            </header>
            <DashboardContent />
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
