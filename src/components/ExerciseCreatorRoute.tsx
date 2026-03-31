import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface ExerciseCreatorRouteProps {
  children: React.ReactNode;
}

const ExerciseCreatorRoute: React.FC<ExerciseCreatorRouteProps> = ({ children }) => {
  const { canCreateExercises } = usePermissions();

  if (!canCreateExercises()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ExerciseCreatorRoute;
