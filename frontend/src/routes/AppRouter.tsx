import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AuthGuard from '../app/AuthGuard';
import { RequireRole } from '../app/RequireRole';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CaseDetailsPage } from '../features/cases/pages/CaseDetailsPage';
import { CasesPage } from '../features/cases/pages/CasesPage';
import { ManagerReviewPage } from '../features/cases/pages/ManagerReviewPage';
import { AppLayout } from '../layout/AppLayout';

const CreateCasePage = lazy(() =>
  import('../features/cases/pages/CreateCasePage').then((mod) => ({
    default: mod.CreateCasePage,
  })),
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
            element: (
              <Suspense
                fallback={
                  <div className="p-8 text-center text-muted">
                    در حال بارگذاری...
                  </div>
                }
              >
                <CreateCasePage />
              </Suspense>
            ),
          },
          {
            path: 'cases/review',
            element: (
              <RequireRole role="MANAGER">
                <ManagerReviewPage />
              </RequireRole>
            ),
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
