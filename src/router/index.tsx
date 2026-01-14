import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage, RegisterPage, ChatPage, SettingsPage } from '../pages';
import { useAuthStore } from '../store/authStore';
import { ToastContainer } from '../components/ui';

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  );
}

// Public route wrapper (redirects to chat if already authenticated)
function PublicRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/chat',
        element: <ChatPage />,
      },
      {
        path: '/chat/:conversationId',
        element: <ChatPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Redirects
  {
    path: '/',
    element: <Navigate to="/chat" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/chat" replace />,
  },
]);
