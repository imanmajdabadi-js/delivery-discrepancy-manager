import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CasesPage } from '../features/cases/pages/CasesPage';
import { CreateCasePage } from '../features/cases/pages/CreateCasePage';
import { CaseDetailsPage } from '../features/cases/pages/CaseDetailsPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AppLayout } from '../layout/AppLayout';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <CasesPage />,
      },
      {
        path: 'cases/new',
        element: <CreateCasePage />,
      },
      {
        path: 'cases/:id',
        element: <CaseDetailsPage />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
