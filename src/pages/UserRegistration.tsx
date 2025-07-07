import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserRegistrationForm from '@/components/auth/UserRegistrationForm';

const UserRegistration = () => {
  const { user, loading, isAdmin } = useAuth();
  const { id } = useParams();

  // Redirect se não estiver logado ou se não for admin
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/entrar" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-totalBlue mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <UserRegistrationForm userId={id} />;
};

export default UserRegistration;