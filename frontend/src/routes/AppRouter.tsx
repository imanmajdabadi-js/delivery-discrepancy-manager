import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CasesPage } from '../features/cases/pages/CasesPage';
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
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
