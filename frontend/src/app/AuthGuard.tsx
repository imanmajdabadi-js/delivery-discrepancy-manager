import { Navigate, Outlet } from 'react-router-dom';
import { decodeBase64Url, type JwtPayload } from '../utils';

function isTokenExpired(token: string): boolean {
  const segments = token.split('.');

  if (segments.length < 3) {
    return true;
  }

  try {
    const claims = JSON.parse(decodeBase64Url(segments[1])) as JwtPayload;

    if (typeof claims.exp !== 'number') {
      return true;
    }

    return Date.now() >= claims.exp * 1000;
  } catch {
    return true;
  }
}

const AuthGuard = () => {
  const hasSession =
    typeof window !== 'undefined' &&
    localStorage.getItem('auth_token') !== null;

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  const token = localStorage.getItem('auth_token');

  if (token && isTokenExpired(token)) {
    localStorage.removeItem('auth_token');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
