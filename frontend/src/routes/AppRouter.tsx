import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CasesPage } from '../features/cases/pages/CasesPage';
import { CreateCasePage } from '../features/cases/pages/CreateCasePage';
import { CaseDetailsPage } from '../features/cases/pages/CaseDetailsPage';
import { ManagerReviewPage } from '../features/cases/pages/ManagerReviewPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { AppLayout } from '../layout/AppLayout';
import AuthGuard from '../app/AuthGuard';

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
    element: <AuthGuard />,
    children: [
      {
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
            path: 'cases/review',
            element: <ManagerReviewPage />,
          },
          {
            path: 'cases/:id',
            element: <CaseDetailsPage />,
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
