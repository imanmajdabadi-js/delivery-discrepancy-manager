import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils';

interface RequireRoleProps {
  role: string;
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const userRole = getUserRole();

  if (userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
