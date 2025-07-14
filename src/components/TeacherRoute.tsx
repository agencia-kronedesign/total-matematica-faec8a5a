import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface TeacherRouteProps {
  children: React.ReactNode;
}

const TeacherRoute: React.FC<TeacherRouteProps> = ({ children }) => {
  const { canCreateExercises } = usePermissions();

  if (!canCreateExercises()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default TeacherRoute;