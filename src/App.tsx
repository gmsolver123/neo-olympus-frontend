import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/authStore';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [initializeAuth]);

  // Show loading state while checking auth
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-olympus-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-void-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
