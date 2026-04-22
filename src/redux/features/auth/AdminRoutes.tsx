import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGetUserQuery } from '@/redux/api/apiSlice';

interface AdminRouteProps {
  allowedRoles: string[];
}

const AdminRoute: React.FC<AdminRouteProps> = ({ allowedRoles }) => {
  const { data: user, } = useGetUserQuery({});

  if (!user) {
    return <Navigate to="/" replace />;
  }
 
  if (!allowedRoles.includes(user?.user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;