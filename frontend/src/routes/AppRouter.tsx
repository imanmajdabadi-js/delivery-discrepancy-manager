import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CasesPage } from '../features/cases/pages/CasesPage';
import { CreateCasePage } from '../features/cases/pages/CreateCasePage';
import { CaseDetailsPage } from '../features/cases/pages/CaseDetailsPage';
import { AppLayout } from '../layout/AppLayout';

const router = createBrowserRouter([
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
        path: 'cases/:caseId',
        element: <CaseDetailsPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
