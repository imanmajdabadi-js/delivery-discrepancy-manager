import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
  const hasSession = typeof window !== 'undefined' && localStorage.getItem('auth_token') !== null;

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
