import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
  const hasOperator = typeof window !== 'undefined' && localStorage.getItem('operator') !== null;

  if (!hasOperator) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
